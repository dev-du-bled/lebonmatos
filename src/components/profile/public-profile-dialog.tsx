"use client";

import {
    useEffect,
    useMemo,
    useRef,
    useState,
    type ChangeEvent,
    type DragEvent,
} from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { TRPCClientError } from "@trpc/client";
import type { inferRouterOutputs } from "@trpc/server";
import { useForm } from "react-hook-form";
import { ZodError } from "zod";
import { Upload, X, Pencil, Loader2 } from "lucide-react";
import { useUploadThing } from "@/utils/uploadthing";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    publicProfileFormSchema,
    normalizePublicProfileInput,
    type PublicProfileFormValues,
} from "@/lib/schema/user";
import { trpc } from "@/trpc/client";
import type { AppRouter } from "@/trpc/routers/_app";
import { cn } from "@/lib/utils";

type UserProfile = inferRouterOutputs<AppRouter>["user"]["getProfile"];

type PublicProfileDialogProps = {
    user: UserProfile;
    trigger?: React.ReactNode;
};

const MAX_AVATAR_BYTES = 4 * 1024 * 1024; // 4 MB (matching uploadthing config)

function getInitials(source?: string | null) {
    if (!source) return "?";
    const cleaned = source.trim();
    if (!cleaned) return "?";
    return (
        cleaned
            .split(/\s+/)
            .slice(0, 2)
            .map((segment) => segment[0]?.toUpperCase())
            .filter(Boolean)
            .join("")
            .slice(0, 2) || "?"
    );
}

export function PublicProfileDialog({
    user,
    trigger,
}: PublicProfileDialogProps) {
    const [open, setOpen] = useState(false);
    const utils = trpc.useUtils();
    const mutation = trpc.user.updatePublicProfile.useMutation();

    // UploadThing hook
    const { startUpload, isUploading } = useUploadThing("profilePicUploader", {
        onClientUploadComplete: (res) => {
            console.log("Upload completed:", res);
        },
        onUploadError: (error) => {
            console.error("Upload error:", error);
            setAvatarError(error.message);
        },
    });

    // Avatar state
    const [avatarError, setAvatarError] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarCleared, setAvatarCleared] = useState(false);
    const [isAvatarDragActive, setIsAvatarDragActive] = useState(false);
    const previewUrlRef = useRef<string | null>(user.image ?? null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(
        user.image ?? null
    );
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // Form state
    const [submitError, setSubmitError] = useState<string | null>(null);

    const form = useForm<PublicProfileFormValues>({
        resolver: zodResolver(publicProfileFormSchema),
        defaultValues: {
            username: user.username ?? "",
            bio: user.bio ?? "",
        },
    });

    // Update form default values when user prop changes
    useEffect(() => {
        if (open) {
            form.reset({
                username: user.username ?? "",
                bio: user.bio ?? "",
            });
            setAvatarFile(null);
            setAvatarCleared(false);
            setAvatarError(null);
            setSubmitError(null);
            setAvatarPreview(user.image ?? null);
            previewUrlRef.current = user.image ?? null;
        }
    }, [open, user, form]);

    useEffect(() => {
        return () => {
            if (
                previewUrlRef.current &&
                previewUrlRef.current.startsWith("blob:")
            ) {
                URL.revokeObjectURL(previewUrlRef.current);
            }
        };
    }, []);

    const watchedUsername = form.watch("username");

    const currentInitials = useMemo(
        () => getInitials(watchedUsername || user.name),
        [watchedUsername, user.name]
    );

    const updatePreview = (value: string | null) => {
        if (
            previewUrlRef.current &&
            previewUrlRef.current.startsWith("blob:")
        ) {
            URL.revokeObjectURL(previewUrlRef.current);
        }
        previewUrlRef.current = value;
        setAvatarPreview(value);
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const applyAvatarFile = (file: File | null) => {
        if (!file) {
            return false;
        }
        if (!file.type.startsWith("image/")) {
            setAvatarError("Veuillez sélectionner un fichier image.");
            return false;
        }
        if (file.size > MAX_AVATAR_BYTES) {
            setAvatarError("L'image doit peser moins de 4 Mo.");
            return false;
        }

        setAvatarError(null);
        setAvatarFile(file);
        setAvatarCleared(false);
        const preview = URL.createObjectURL(file);
        updatePreview(preview);
        return true;
    };

    const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;
        const accepted = applyAvatarFile(file);
        if (!accepted && event.target) {
            event.target.value = "";
        }
    };

    const handleAvatarDragOver = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
        if (!isAvatarDragActive) {
            setIsAvatarDragActive(true);
        }
    };

    const handleAvatarDragLeave = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        if (
            event.currentTarget.contains(event.relatedTarget as Node) ||
            !isAvatarDragActive
        ) {
            return;
        }
        setIsAvatarDragActive(false);
    };

    const handleAvatarDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsAvatarDragActive(false);
        const file = event.dataTransfer.files?.[0] ?? null;
        applyAvatarFile(file);
    };

    const handleAvatarRemove = () => {
        if (!avatarPreview && !user.image && !avatarFile) {
            return;
        }
        setAvatarFile(null);
        setAvatarCleared(true);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        updatePreview(null);
    };

    const handleSubmit = async (values: PublicProfileFormValues) => {
        setSubmitError(null);

        try {
            let avatarUrl: string | null = null;

            // Upload avatar if there's a new file
            if (avatarFile) {
                const uploadResult = await startUpload([avatarFile]);
                if (!uploadResult || uploadResult.length === 0) {
                    throw new Error("Échec du téléchargement de l'image");
                }
                avatarUrl = uploadResult[0].serverData.source;
            }

            const payload = normalizePublicProfileInput(values, {
                avatar: avatarUrl,
                removeAvatar: avatarCleared && !avatarFile,
            });

            const updated = await mutation.mutateAsync(payload);

            utils.user.getProfile.setData(undefined, updated);
            setOpen(false);
        } catch (error) {
            if (error instanceof TRPCClientError) {
                if (error.data?.code === "CONFLICT") {
                    form.setError("username", {
                        type: "manual",
                        message: error.message,
                    });
                } else {
                    setSubmitError(error.message);
                }
                return;
            }

            if (error instanceof ZodError) {
                setSubmitError(
                    error.issues[0]?.message ?? "Erreur de validation"
                );
                return;
            }

            setSubmitError(
                error instanceof Error
                    ? error.message
                    : "Une erreur inattendue est survenue."
            );
        }
    };

    const isAvatarDirty = Boolean(avatarFile) || avatarCleared;
    const isFormDirty = form.formState.isDirty;
    const canSubmit =
        (isFormDirty || isAvatarDirty) && !mutation.isPending && !isUploading;
    const isSubmitting = mutation.isPending || isUploading;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" className="gap-2">
                        <Pencil className="size-4" />
                        Modifier mon profil public
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Modifier le profil public</DialogTitle>
                    <DialogDescription>
                        Ces informations seront visibles par tous les
                        utilisateurs de la plateforme.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className="space-y-6 pt-4"
                    >
                        <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
                            {/* Avatar Section */}
                            <div className="flex flex-col items-center gap-4">
                                <div
                                    className={cn(
                                        "group relative flex size-32 cursor-pointer items-center justify-center rounded-full border-4 border-background shadow-xl ring-1 ring-border transition-all hover:scale-105",
                                        isAvatarDragActive &&
                                            "ring-primary ring-2",
                                        isUploading &&
                                            "opacity-50 cursor-not-allowed"
                                    )}
                                    onClick={
                                        !isUploading
                                            ? handleAvatarClick
                                            : undefined
                                    }
                                    onDragEnter={
                                        !isUploading
                                            ? handleAvatarDragOver
                                            : undefined
                                    }
                                    onDragOver={
                                        !isUploading
                                            ? handleAvatarDragOver
                                            : undefined
                                    }
                                    onDragLeave={
                                        !isUploading
                                            ? handleAvatarDragLeave
                                            : undefined
                                    }
                                    onDrop={
                                        !isUploading
                                            ? handleAvatarDrop
                                            : undefined
                                    }
                                >
                                    <Avatar className="size-full">
                                        {avatarPreview ? (
                                            <AvatarImage
                                                src={avatarPreview}
                                                alt={
                                                    watchedUsername || user.name
                                                }
                                                className="object-cover"
                                            />
                                        ) : (
                                            <AvatarFallback className="bg-secondary text-3xl font-semibold text-secondary-foreground">
                                                {currentInitials}
                                            </AvatarFallback>
                                        )}
                                    </Avatar>
                                    {isUploading ? (
                                        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60">
                                            <Loader2 className="size-8 text-white animate-spin" />
                                        </div>
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                                            <Upload className="size-6 text-white" />
                                        </div>
                                    )}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleAvatarChange}
                                        disabled={isUploading}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    {(avatarPreview ||
                                        user.image ||
                                        avatarFile) && (
                                        <Button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleAvatarRemove();
                                            }}
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 text-xs text-muted-foreground hover:text-destructive"
                                            disabled={isUploading}
                                        >
                                            <X className="mr-2 size-3" />
                                            Supprimer la photo
                                        </Button>
                                    )}
                                    {avatarError && (
                                        <p className="text-xs font-medium text-destructive max-w-[150px] text-center">
                                            {avatarError}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Fields Section */}
                            <div className="flex-1 space-y-4 w-full">
                                <FormField
                                    control={form.control}
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Nom d&apos;utilisateur
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="@utilisateur"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="bio"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Bio</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Parlez-nous de vous..."
                                                    className="min-h-[120px] resize-none"
                                                    {...field}
                                                    value={field.value ?? ""}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Dites-en un peu plus sur vous.
                                                (Max 500 caractères)
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {submitError && (
                            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                                {submitError}
                            </div>
                        )}

                        <DialogFooter className="gap-2 sm:gap-2">
                            <DialogClose asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={isSubmitting}
                                >
                                    Annuler
                                </Button>
                            </DialogClose>
                            <Button
                                type="submit"
                                disabled={!canSubmit}
                                loading={isSubmitting}
                            >
                                Enregistrer
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
