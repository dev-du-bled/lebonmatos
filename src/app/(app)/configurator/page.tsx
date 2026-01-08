"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ComponentType } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import {
  ComponentSelector,
  SelectedPost,
} from "@/components/configurator/component-selector";
import {
  ALL_COMPONENT_TYPES,
  COMPONENT_TYPE_LABELS,
  MULTI_QUANTITY_TYPES,
  checkCompatibility,
  isConfigurationComplete,
  hasStorage,
  type ConfigurationSlot,
  type CompatibilityIssue,
} from "@/lib/compatibility";
import { trpc } from "@/trpc/client";
import { authClient } from "@/lib/auth-client";
import {
  Plus,
  Trash2,
  AlertTriangle,
  AlertCircle,
  Share2,
  Save,
  Copy,
  Check,
  Loader2,
} from "lucide-react";
import Image from "next/image";

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

export default function ConfiguratorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const configId = searchParams.get("id");

  const { data: session, isPending: isSessionLoading } =
    authClient.useSession();
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
  const [copied, setCopied] = useState(false);
  const toastIdRef = useRef<string | number | null>(null);

  // Load configuration if ID is provided
  const configQuery = trpc.configuration.get.useQuery(
    { id: configId! },
    { enabled: !!configId }
  );

  const saveMutation = trpc.configuration.save.useMutation();
  const cloneMutation = trpc.configuration.clone.useMutation();

  // Load config from URL
  useEffect(() => {
    if (configQuery.data) {
      const loadedConfig = configQuery.data;
      // If no session yet, we can't determine ownership reliably, but usually userId string comparison works if logged in.
      // If not logged in, session is null, isOwner is false.
      const isOwner = session?.user?.id
        ? loadedConfig.userId === session.user.id
        : false;

      setConfig((prev) => ({
        id: isOwner ? loadedConfig.id : undefined,
        name: isOwner ? loadedConfig.name : `${loadedConfig.name} (copie)`,
        isOwner,
        isPublic: loadedConfig.isPublic,
        slots: ALL_COMPONENT_TYPES.map((type) => {
          const items = loadedConfig.items.filter(
            (item) => item.componentType === type
          );
          if (items.length === 0) {
            return { componentType: type, post: null, quantity: 1 };
          }
          // Take the first item for simplicity (multi-quantity support can be expanded)
          const item = items[0];
          return {
            componentType: type,
            post: item.post
              ? {
                  id: item.post.id,
                  title: item.post.title,
                  price: item.post.price,
                  images: item.post.images,
                  component: item.post.component as SelectedPost["component"],
                }
              : null,
            quantity: item.quantity,
          };
        }),
      }));
    }
  }, [configQuery.data, session?.user?.id]);

  // Check compatibility
  const compatibilityIssues = checkCompatibility(config.slots);
  const isComplete = isConfigurationComplete(config.slots);
  const hasStorageComponent = hasStorage(config.slots);

  // Manage compatibility toast
  useEffect(() => {
    const errorIssues = compatibilityIssues.filter((i) => i.type === "error");
    // Toast removed as requested
  }, [compatibilityIssues]);

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
          slot.componentType === selectedType ? { ...slot, post } : slot
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
        id: config.id, // Pass existing ID if we have it
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

      // Update URL with the new ID without reloading the page if it's a new config
      if (!config.id) {
        window.history.replaceState(null, "", `/configurator?id=${result.id}`);
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
      // Store current state in localStorage before redirecting
      localStorage.setItem("pendingConfiguration", JSON.stringify(config));
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
    // If not saved yet, save first as public
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
      // Make sure it's public
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

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLoginRedirect = () => {
    router.push(`/login?redirect=/configurator`);
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

  if (configId && configQuery.isLoading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <Skeleton className="h-10 w-64 mb-8" />
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {config.id && config.name ? config.name : "Configurateur"}
          </h1>
          <p className="text-muted-foreground mt-1">
            Créez votre PC sur mesure en sélectionnant vos composants.
          </p>
        </div>
        <Button variant="destructive" size="sm" onClick={handleClearAll}>
          <Trash2 className="size-4 mr-2" />
          Tout effacer
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Component slots */}
        <div className="lg:col-span-2 space-y-4">
          {ALL_COMPONENT_TYPES.map((type) => {
            const slot = config.slots.find((s) => s.componentType === type);
            const isMulti = MULTI_QUANTITY_TYPES.includes(type);

            const issuesForComponent = compatibilityIssues.filter((issue) =>
              issue.affectedComponents.includes(type)
            );
            const hasError = issuesForComponent.some((i) => i.type === "error");

            return (
              <Card
                key={type}
                className={`transition-all hover:shadow-md p-0 gap-0 ${
                  hasError ? "border-destructive border-2" : ""
                }`}
              >
                <CardHeader className="p-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {COMPONENT_TYPE_LABELS[type]}
                      {hasError && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="cursor-help inline-flex items-center justify-center rounded-full bg-destructive/10 p-1 text-destructive">
                                <AlertCircle className="size-4" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="text-sm font-normal max-w-xs">
                                {issuesForComponent.map((issue, i) => (
                                  <p key={i} className="mb-1 last:mb-0">
                                    {issue.message}
                                  </p>
                                ))}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </CardTitle>
                    {(!slot?.post || isMulti) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openSelector(type)}
                      >
                        <Plus className="size-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <Separator />
                <CardContent className="p-4">
                  {slot?.post ? (
                    <div className="flex items-center gap-4">
                      <div className="relative size-20 shrink-0 bg-muted rounded-lg overflow-hidden border">
                        {slot.post.images?.[0] ? (
                          <Image
                            src={slot.post.images[0]}
                            alt={slot.post.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="size-full flex items-center justify-center text-muted-foreground text-xs">
                            N/A
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <p className="font-medium truncate text-base">
                          {slot.post.title}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {slot.post.component.name}
                        </p>
                      </div>
                      {isMulti && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            x
                          </span>
                          <Input
                            type="number"
                            min={1}
                            max={10}
                            value={slot.quantity}
                            onChange={(e) =>
                              handleQuantityChange(
                                type,
                                parseInt(e.target.value)
                              )
                            }
                            className="w-16 text-center"
                          />
                        </div>
                      )}
                      <div className="text-right shrink-0 min-w-[80px]">
                        <p className="font-semibold text-lg">
                          {slot.post.price * slot.quantity} €
                        </p>
                        {isMulti && slot.quantity > 1 && (
                          <p className="text-xs text-muted-foreground">
                            {slot.post.price} € / unité
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        onClick={() => handleRemovePost(type)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ) : (
                    <button
                      onClick={() => openSelector(type)}
                      className="w-full py-6 border-2 border-dashed rounded-lg text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2 group"
                    >
                      <div className="size-8 rounded-full bg-muted group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                        <Plus className="size-4" />
                      </div>
                      <span className="font-medium">
                        Ajouter un {COMPONENT_TYPE_LABELS[type].toLowerCase()}
                      </span>
                    </button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Summary sidebar */}
        <div className="space-y-4" id="compatibility-summary">
          <Card className="sticky top-24 shadow-sm border-2 overflow-hidden p-0 gap-0">
            <CardHeader className="bg-muted/30 p-4">
              <CardTitle className="text-xl">Récapitulatif</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="space-y-6 p-6">
              {/* Compatibility issues */}
              {compatibilityIssues.length > 0 && (
                <div className="space-y-3">
                  {compatibilityIssues.map((issue, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-3 p-3 rounded-lg text-sm border ${
                        issue.type === "error"
                          ? "bg-destructive/10 border-destructive/20 text-destructive"
                          : "bg-yellow-500/10 border-yellow-500/20 text-yellow-600"
                      }`}
                    >
                      {issue.type === "error" ? (
                        <AlertCircle className="size-5 shrink-0" />
                      ) : (
                        <AlertTriangle className="size-5 shrink-0" />
                      )}
                      <span className="font-medium">{issue.message}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Warnings */}
              {!isComplete && (
                <div className="flex items-start gap-3 p-3 rounded-lg text-sm bg-blue-500/10 border border-blue-500/20 text-blue-600">
                  <AlertCircle className="size-5 shrink-0" />
                  <span className="font-medium">
                    La configuration est incomplète
                  </span>
                </div>
              )}
              {isComplete && !hasStorageComponent && (
                <div className="flex items-start gap-3 p-3 rounded-lg text-sm bg-orange-500/10 border border-orange-500/20 text-orange-600">
                  <AlertTriangle className="size-5 shrink-0" />
                  <span className="font-medium">
                    Pensez à ajouter du stockage (SSD/HDD)
                  </span>
                </div>
              )}

              {/* Items list */}
              <div className="space-y-3">
                {config.slots
                  .filter((slot) => slot.post)
                  .map((slot) => (
                    <div
                      key={slot.componentType}
                      className="flex justify-between text-sm items-center"
                    >
                      <span className="text-muted-foreground truncate pr-4 flex-1">
                        {COMPONENT_TYPE_LABELS[slot.componentType]}
                      </span>
                      <span className="font-medium whitespace-nowrap">
                        {slot.post!.price * slot.quantity} €
                      </span>
                    </div>
                  ))}
              </div>

              <Separator />

              {/* Total */}
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">Total estimé</span>
                <span className="text-2xl font-bold text-primary-600">
                  {totalPrice} €
                </span>
              </div>

              {/* Actions */}
              <div className="space-y-3 pt-2">
                <Button
                  className="w-full h-12 text-base font-semibold shadow-sm"
                  onClick={handleSave}
                  disabled={saveMutation.isPending}
                >
                  {saveMutation.isPending ? (
                    <Loader2 className="size-5 mr-2 animate-spin" />
                  ) : (
                    <Save className="size-5 mr-2" />
                  )}
                  {config.id ? "Mettre à jour" : "Enregistrer la config"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-10"
                  onClick={handleShare}
                  disabled={
                    config.slots.filter((s) => s.post).length === 0 ||
                    saveMutation.isPending
                  }
                >
                  <Share2 className="size-4 mr-2" />
                  Partager le lien
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
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
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enregistrer la configuration</DialogTitle>
            <DialogDescription>
              Donnez un nom à votre configuration pour la retrouver facilement.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleConfirmSave();
            }}
          >
            <div className="py-4">
              <Input
                placeholder="Nom de la configuration"
                value={config.name}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSaveDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={saveMutation.isPending || !config.name.trim()}
              >
                {saveMutation.isPending ? (
                  <Loader2 className="size-4 mr-2 animate-spin" />
                ) : null}
                Enregistrer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Partager la configuration</DialogTitle>
            <DialogDescription>
              Copiez ce lien pour partager votre configuration avec vos amis.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 py-4">
            <Input value={shareUrl} readOnly className="flex-1" />
            <Button onClick={handleCopyUrl}>
              {copied ? (
                <Check className="size-4" />
              ) : (
                <Copy className="size-4" />
              )}
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={() => setShareDialogOpen(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Login Prompt Dialog */}
      <Dialog open={loginPromptOpen} onOpenChange={setLoginPromptOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connexion requise</DialogTitle>
            <DialogDescription>
              Vous devez être connecté pour enregistrer ou partager votre
              configuration. Votre configuration actuelle sera conservée.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLoginPromptOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleLoginRedirect}>Se connecter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
