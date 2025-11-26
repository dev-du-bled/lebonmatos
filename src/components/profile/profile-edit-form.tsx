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
import { Upload, X, Star, Undo2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  normalizeProfileInput,
  profileFormSchema,
  type ProfileFormValues,
  type ProfileUpdateInput,
} from "@/lib/schema/user";
import { FileToBase64 } from "@/utils/file";
import { trpc } from "@/trpc/client";
import type { AppRouter } from "@/trpc/routers/_app";

import { cn } from "@/lib/utils";

type UserProfile = inferRouterOutputs<AppRouter>["user"]["getProfile"];

type ProfileEditFormProps = {
  initialData: UserProfile;
};

const MAX_AVATAR_BYTES = 5 * 1024 * 1024; // 5 Mo

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

export function ProfileEditForm({ initialData }: ProfileEditFormProps) {
  const utils = trpc.useUtils();
  const mutation = trpc.user.updateProfile.useMutation();
  const [snapshot, setSnapshot] = useState<UserProfile>(initialData);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarCleared, setAvatarCleared] = useState(false);
  const [isAvatarDragActive, setIsAvatarDragActive] = useState(false);
  const previewUrlRef = useRef<string | null>(
    initialData.profileImage?.image ?? null
  );
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    initialData.profileImage?.image ?? null
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current && previewUrlRef.current.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: initialData.name,
      username: initialData.username ?? "",
      phoneNumber: initialData.phoneNumber ?? "",
    },
  });

  const watchedUsername = form.watch("username");
  const watchedName = form.watch("name");

  const currentInitials = useMemo(
    () => getInitials(watchedUsername || watchedName),
    [watchedUsername, watchedName]
  );

  const ratingAverage = snapshot.rating.average;
  const ratingCount = snapshot.rating.count;

  const updatePreview = (value: string | null) => {
    if (previewUrlRef.current && previewUrlRef.current.startsWith("blob:")) {
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
      setAvatarError("L'image doit peser moins de 5 Mo.");
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
    if (!avatarPreview && !snapshot.profileImage && !avatarFile) {
      return;
    }
    setAvatarFile(null);
    setAvatarCleared(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    updatePreview(null);
  };

  const resetForm = (profile: UserProfile) => {
    setAvatarFile(null);
    setAvatarCleared(false);
    setAvatarError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    updatePreview(profile.profileImage?.image ?? null);
    form.reset({
      name: profile.name,
      username: profile.username ?? "",
      phoneNumber: profile.phoneNumber ?? "",
    });
  };

  const handleReset = () => {
    setSubmitError(null);
    setSubmitSuccess(false);
    resetForm(snapshot);
  };

  const handleSubmit = async (values: ProfileFormValues) => {
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      let avatarPayload: { data: string; alt?: string | null } | null = null;

      if (avatarFile) {
        const dataUrl = await FileToBase64(avatarFile);
        const altText = values.username.trim() || values.name.trim();
        avatarPayload = {
          data: dataUrl,
          alt: altText,
        };
      }

      const payload: ProfileUpdateInput = normalizeProfileInput(values, {
        avatar: avatarPayload,
        removeAvatar: avatarCleared && !avatarFile,
      });

      const updated = await mutation.mutateAsync(payload);

      setSnapshot(updated);
      utils.user.getProfile.setData(undefined, updated);
      resetForm(updated);
      setSubmitSuccess(true);
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
        setSubmitError(error.issues[0]?.message ?? "Erreur de validation");
        return;
      }

      setSubmitError("Une erreur inattendue est survenue.");
    }
  };

  const isAvatarDirty = Boolean(avatarFile) || avatarCleared;
  const isFormDirty = form.formState.isDirty;
  const canSubmit = (isFormDirty || isAvatarDirty) && !mutation.isPending;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold sm:text-4xl">
          Éditer mon profil
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Personnalisez les informations partagées avec la communauté
          LeBonMatos.
        </p>
      </div>
      <Card className=" shadow-lg">
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-2xl">Informations publiques</CardTitle>
              <CardDescription>
                Mettez à jour votre identité, vos coordonnées et votre
                présentation.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-sm font-medium">
              <Star className="size-4 text-primary" fill="currentColor" />
              <span>
                {ratingCount
                  ? `${ratingAverage?.toFixed(1) ?? "-"} · ${ratingCount} ${
                      ratingCount > 1 ? "avis" : "avis"
                    }`
                  : "Pas encore d'avis"}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="flex flex-col gap-6"
            >
              <div className="grid gap-6 lg:grid-cols-[minmax(0,280px)_1fr]">
                <section>
                  <div
                    className={cn(
                      "group relative flex flex-col items-center gap-5 rounded-2xl border-2 border-dashed border-muted bg-muted/20 p-6 text-center transition-all hover:bg-muted/30",
                      isAvatarDragActive && "border-primary/50 bg-primary/5"
                    )}
                    onDragEnter={handleAvatarDragOver}
                    onDragOver={handleAvatarDragOver}
                    onDragLeave={handleAvatarDragLeave}
                    onDrop={handleAvatarDrop}
                  >
                    <div className="relative flex size-32 items-center justify-center rounded-full border-4 border-background shadow-xl ring-1 ring-border transition-transform group-hover:scale-105">
                      <Avatar className="size-full">
                        {avatarPreview ? (
                          <AvatarImage
                            src={avatarPreview}
                            alt={watchedUsername || watchedName}
                            className="object-cover"
                          />
                        ) : (
                          <AvatarFallback className="bg-secondary text-3xl font-semibold text-secondary-foreground">
                            {currentInitials}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      {isAvatarDirty && (
                        <div className="absolute right-0 top-0 flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
                          <Upload className="size-4" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-1.5 text-sm text-muted-foreground">
                      <p className="font-medium text-foreground">
                        Photo de profil
                      </p>
                      <p className="text-xs">JPG, PNG ou WEBP. Max 5 Mo.</p>
                      {avatarError && (
                        <p className="font-medium text-destructive">
                          {avatarError}
                        </p>
                      )}
                    </div>
                    <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
                      <Button
                        type="button"
                        onClick={handleAvatarClick}
                        variant="secondary"
                        size="sm"
                        disabled={mutation.isPending}
                      >
                        <Upload className="mr-2 size-4" />
                        Importer
                      </Button>
                      {(avatarPreview ||
                        snapshot.profileImage ||
                        avatarFile) && (
                        <Button
                          type="button"
                          onClick={handleAvatarRemove}
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-destructive"
                          disabled={mutation.isPending}
                        >
                          <X className="mr-2 size-4" />
                          Supprimer
                        </Button>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </div>
                </section>
                <section className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom complet</FormLabel>
                        <FormControl>
                          <Input placeholder="Prénom Nom" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom d&apos;utilisateur</FormLabel>
                        <FormControl>
                          <Input placeholder="mangeurdemsemen" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem className="md:col-span-1">
                        <FormLabel>Téléphone</FormLabel>
                        <FormControl>
                          <Input placeholder="+33 6 12 34 56 78" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </section>
              </div>

              {submitError && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {submitError}
                </div>
              )}
              {submitSuccess && !submitError && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  Profil mis à jour avec succès.
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  disabled={
                    mutation.isPending || (!isFormDirty && !isAvatarDirty)
                  }
                >
                  <Undo2 className="size-4" />
                  Réinitialiser
                </Button>
                <Button type="submit" disabled={!canSubmit}>
                  {mutation.isPending
                    ? "Enregistrement..."
                    : "Enregistrer les modifications"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProfileEditForm;
