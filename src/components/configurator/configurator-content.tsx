"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { ComponentType } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    ComponentSelector,
    SelectedPost,
} from "@/components/configurator/component-selector";
import { ConfigSlotCard } from "@/components/configurator/config-slot-card";
import { ConfigSummary } from "@/components/configurator/config-summary";
import {
    SaveDialog,
    ShareDialog,
    LoginPromptDialog,
} from "@/components/configurator/config-dialogs";
import {
    ALL_COMPONENT_TYPES,
    checkCompatibility,
    isConfigurationComplete,
    hasStorage,
    type ConfigurationSlot,
} from "@/lib/compatibility";
import { trpc } from "@/trpc/client";
import { useSession } from "../auth/session-provider";
import { Trash2, Pencil, Check, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

type ConfigurationState = {
    id?: string;
    name: string;
    isOwner: boolean;
    isPublic: boolean;
    slots: ConfigurationSlot[];
};

const initialSlots: ConfigurationSlot[] = ALL_COMPONENT_TYPES.map((type) => ({
    componentType: type,
    post: null,
    quantity: 1,
}));

export function ConfiguratorContent() {
    const searchParams = useSearchParams();
    const configId = searchParams.get("id");

    const { session } = useSession();
    const isAuthenticated = !!session?.user;

    const [config, setConfig] = useState<ConfigurationState>({
        name: "Ma configuration",
        isOwner: true,
        isPublic: false,
        slots: initialSlots,
    });

    const [selectorOpen, setSelectorOpen] = useState(false);
    const [selectedType, setSelectedType] = useState<ComponentType>("CPU");
    const [saveDialogOpen, setSaveDialogOpen] = useState(false);
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const [loginPromptOpen, setLoginPromptOpen] = useState(false);
    const [shareUrl, setShareUrl] = useState("");

    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState("");
    const [isSavingName, setIsSavingName] = useState(false);

    // Load configuration if ID is provided
    const configQuery = trpc.configuration.get.useQuery(
        { id: configId! },
        { enabled: !!configId }
    );

    const saveMutation = trpc.configuration.save.useMutation();

    // Load config from URL
    useEffect(() => {
        if (configQuery.data) {
            const loadedConfig = configQuery.data;
            const isOwner = session?.user?.id
                ? loadedConfig.userId === session.user.id
                : false;

            setConfig({
                id: isOwner ? loadedConfig.id : undefined,
                name: isOwner
                    ? loadedConfig.name
                    : `${loadedConfig.name} (copie)`,
                isOwner,
                isPublic: loadedConfig.isPublic,
                slots: ALL_COMPONENT_TYPES.map((type) => {
                    const items = loadedConfig.items.filter(
                        (item) => item.componentType === type
                    );
                    if (items.length === 0) {
                        return { componentType: type, post: null, quantity: 1 };
                    }
                    const item = items[0];
                    return {
                        componentType: type,
                        post: item.post
                            ? {
                                  id: item.post.id,
                                  title: item.post.title,
                                  price: item.post.price,
                                  images: item.post.images,
                                  component: item.post
                                      .component as SelectedPost["component"],
                              }
                            : null,
                        quantity: item.quantity,
                    };
                }),
            });
        }
    }, [configQuery.data, session?.user?.id]);

    // Check compatibility
    const compatibilityIssues = checkCompatibility(config.slots);
    const isComplete = isConfigurationComplete(config.slots);
    const hasStorageComponent = hasStorage(config.slots);

    // Calculate total price
    const totalPrice = config.slots.reduce((acc, slot) => {
        if (!slot.post) return acc;
        return acc + slot.post.price * slot.quantity;
    }, 0);

    // Handlers
    const openSelector = (type: ComponentType) => {
        setSelectedType(type);
        setSelectorOpen(true);
    };

    const handleSelectPost = useCallback(
        (post: SelectedPost) => {
            setConfig((prev) => ({
                ...prev,
                slots: prev.slots.map((slot) =>
                    slot.componentType === selectedType
                        ? { ...slot, post }
                        : slot
                ),
            }));
        },
        [selectedType]
    );

    const handleRemovePost = (type: ComponentType) => {
        setConfig((prev) => ({
            ...prev,
            slots: prev.slots.map((slot) =>
                slot.componentType === type
                    ? { ...slot, post: null, quantity: 1 }
                    : slot
            ),
        }));
    };

    const handleQuantityChange = (type: ComponentType, quantity: number) => {
        if (quantity < 1 || quantity > 10) return;
        setConfig((prev) => ({
            ...prev,
            slots: prev.slots.map((slot) =>
                slot.componentType === type ? { ...slot, quantity } : slot
            ),
        }));
    };

    const handleClearAll = () => {
        setConfig((prev) => ({
            ...prev,
            id: undefined,
            slots: initialSlots,
        }));
    };

    const handleConfirmSave = async () => {
        try {
            const result = await saveMutation.mutateAsync({
                id: config.id,
                name: config.name,
                isPublic: config.isPublic,
                items: config.slots
                    .filter((slot) => slot.post)
                    .map((slot) => ({
                        componentType: slot.componentType,
                        postId: slot.post!.id,
                        quantity: slot.quantity,
                    })),
            });

            if (!config.id) {
                window.history.replaceState(
                    null,
                    "",
                    `/configurator?id=${result.id}`
                );
            }

            setConfig((prev) => ({
                ...prev,
                id: result.id,
                name: result.name,
                isOwner: true,
            }));

            setSaveDialogOpen(false);
            toast.success("Configuration enregistrée");
        } catch (error) {
            console.error("Failed to save configuration:", error);
            toast.error("Erreur lors de l'enregistrement");
        }
    };

    const handleSave = async () => {
        if (!isAuthenticated) {
            localStorage.setItem(
                "pendingConfiguration",
                JSON.stringify(config)
            );
            setLoginPromptOpen(true);
            return;
        }

        if (config.id && config.isOwner) {
            await handleConfirmSave();
        } else {
            setSaveDialogOpen(true);
        }
    };

    const handleShare = async () => {
        if (!config.id) {
            if (!isAuthenticated) {
                localStorage.setItem(
                    "pendingConfiguration",
                    JSON.stringify({ ...config, isPublic: true })
                );
                setLoginPromptOpen(true);
                return;
            }

            try {
                const result = await saveMutation.mutateAsync({
                    name: config.name,
                    isPublic: true,
                    items: config.slots
                        .filter((slot) => slot.post)
                        .map((slot) => ({
                            componentType: slot.componentType,
                            postId: slot.post!.id,
                            quantity: slot.quantity,
                        })),
                });

                setConfig((prev) => ({
                    ...prev,
                    id: result.id,
                    isOwner: true,
                    isPublic: true,
                }));

                const url = `${window.location.origin}/configurator?id=${result.id}`;
                setShareUrl(url);
                setShareDialogOpen(true);
            } catch (error) {
                console.error("Failed to share configuration:", error);
            }
        } else {
            if (!config.isPublic) {
                await saveMutation.mutateAsync({
                    id: config.id,
                    name: config.name,
                    isPublic: true,
                    items: config.slots
                        .filter((slot) => slot.post)
                        .map((slot) => ({
                            componentType: slot.componentType,
                            postId: slot.post!.id,
                            quantity: slot.quantity,
                        })),
                });
                setConfig((prev) => ({ ...prev, isPublic: true }));
            }

            const url = `${window.location.origin}/configurator?id=${config.id}`;
            setShareUrl(url);
            setShareDialogOpen(true);
        }
    };

    // Restore pending config after login
    useEffect(() => {
        if (isAuthenticated && !configId) {
            const pending = localStorage.getItem("pendingConfiguration");
            if (pending) {
                try {
                    const parsed = JSON.parse(pending);
                    setConfig(parsed);
                    localStorage.removeItem("pendingConfiguration");
                } catch {
                    // Invalid JSON, ignore
                }
            }
        }
    }, [isAuthenticated, configId]);

    const handleSaveName = async () => {
        if (!tempName.trim() || !config.id) return;

        setIsSavingName(true);
        try {
            await saveMutation.mutateAsync({
                id: config.id,
                name: tempName,
                isPublic: config.isPublic,
                items: config.slots
                    .filter((slot) => slot.post)
                    .map((slot) => ({
                        componentType: slot.componentType,
                        postId: slot.post!.id,
                        quantity: slot.quantity,
                    })),
            });
            setConfig((prev) => ({ ...prev, name: tempName }));
            setIsEditingName(false);
            toast.success("Nom mis à jour");
        } catch (error) {
            console.error("Failed to update name:", error);
            let errorMessage =
                error instanceof Error
                    ? error.message
                    : "Erreur lors de la mise à jour du nom";

            // Try to parse raw Zod error array
            try {
                if (
                    errorMessage.startsWith("[") &&
                    errorMessage.endsWith("]")
                ) {
                    const parsed = JSON.parse(errorMessage);
                    if (
                        Array.isArray(parsed) &&
                        parsed.length > 0 &&
                        parsed[0].message
                    ) {
                        errorMessage = parsed[0].message;
                    }
                }
            } catch {
                errorMessage =
                    error instanceof Error
                        ? error.message
                        : "Erreur lors de la mise à jour du nom";
                toast.error(errorMessage);
            }

            toast.error(errorMessage);
        } finally {
            setIsSavingName(false);
        }
    };

    const handleCancelNameEdit = () => {
        setIsEditingName(false);
        setTempName(config.name);
    };

    // Loading state for config
    const isLoadingConfig = !!configId && configQuery.isLoading;

    return (
        <section className="mx-auto w-full max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                <div className="flex-1 min-w-0">
                    {isLoadingConfig && configId ? (
                        <Skeleton className="h-9 w-64" />
                    ) : isEditingName ? (
                        <form
                            className="flex items-center gap-1 max-w-sm"
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSaveName();
                            }}
                        >
                            <Input
                                value={tempName}
                                onChange={(e) => setTempName(e.target.value)}
                                className="h-auto py-0.5 px-2 text-3xl font-bold tracking-tight"
                                onKeyDown={(e) => {
                                    if (e.key === "Escape") {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleCancelNameEdit();
                                    }
                                }}
                                onBlur={handleCancelNameEdit}
                                autoFocus
                                disabled={isSavingName}
                            />
                            <Button
                                type="submit"
                                size="icon"
                                variant="ghost"
                                className="size-9 shrink-0"
                                disabled={isSavingName}
                                onMouseDown={(e) => e.preventDefault()}
                            >
                                {isSavingName ? (
                                    <Loader2 className="size-5 animate-spin" />
                                ) : (
                                    <Check className="size-5 text-green-600" />
                                )}
                            </Button>
                            <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={handleCancelNameEdit}
                                className="size-9 shrink-0"
                                disabled={isSavingName}
                                onMouseDown={(e) => e.preventDefault()}
                            >
                                <X className="size-5 text-red-600" />
                            </Button>
                        </form>
                    ) : (
                        <div className="flex items-center gap-2 group">
                            <h1 className="text-3xl font-bold tracking-tight truncate">
                                {config.id && config.name
                                    ? config.name
                                    : "Configurateur"}
                            </h1>
                            {config.id && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-9 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                                    onClick={() => {
                                        setTempName(config.name);
                                        setIsEditingName(true);
                                    }}
                                >
                                    <Pencil className="size-4 text-muted-foreground" />
                                </Button>
                            )}
                        </div>
                    )}
                    <p className="text-muted-foreground mt-1">
                        Créez votre PC sur mesure en sélectionnant vos
                        composants.
                    </p>
                </div>
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleClearAll}
                >
                    <Trash2 className="size-4 mr-2" />
                    Tout effacer
                </Button>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Component slots */}
                <div className="lg:col-span-2 space-y-4">
                    {ALL_COMPONENT_TYPES.map((type) => {
                        const slot = config.slots.find(
                            (s) => s.componentType === type
                        );
                        const issuesForComponent = compatibilityIssues.filter(
                            (issue) => issue.affectedComponents.includes(type)
                        );

                        return (
                            <ConfigSlotCard
                                key={type}
                                componentType={type}
                                post={slot?.post ?? null}
                                quantity={slot?.quantity ?? 1}
                                issues={issuesForComponent}
                                onOpenSelector={openSelector}
                                onRemove={handleRemovePost}
                                onQuantityChange={handleQuantityChange}
                                isLoading={isLoadingConfig}
                            />
                        );
                    })}
                </div>

                {/* Summary sidebar */}
                <ConfigSummary
                    slots={config.slots}
                    totalPrice={totalPrice}
                    compatibilityIssues={compatibilityIssues}
                    isComplete={isComplete}
                    hasStorageComponent={hasStorageComponent}
                    configId={config.id}
                    isSaving={saveMutation.isPending}
                    onSave={handleSave}
                    onShare={handleShare}
                    isLoading={isLoadingConfig}
                />
            </div>

            {/* Component Selector Dialog */}
            <ComponentSelector
                open={selectorOpen}
                onOpenChange={setSelectorOpen}
                componentType={selectedType}
                onSelect={handleSelectPost}
                isAuthenticated={isAuthenticated}
            />

            {/* Save Dialog */}
            <SaveDialog
                open={saveDialogOpen}
                onOpenChange={setSaveDialogOpen}
                name={config.name}
                onNameChange={(name) =>
                    setConfig((prev) => ({ ...prev, name }))
                }
                onConfirm={handleConfirmSave}
                isPending={saveMutation.isPending}
            />

            {/* Share Dialog */}
            <ShareDialog
                open={shareDialogOpen}
                onOpenChange={setShareDialogOpen}
                shareUrl={shareUrl}
            />

            {/* Login Prompt Dialog */}
            <LoginPromptDialog
                open={loginPromptOpen}
                onOpenChange={setLoginPromptOpen}
            />
        </section>
    );
}
