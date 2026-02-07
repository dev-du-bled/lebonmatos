"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../ui/card";
import { Separator } from "../ui/separator";
import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
    Form,
} from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import ComponentSelector from "./component-selector";
import { ReturnedComponent } from "@/utils/components";
import { trpc } from "@/trpc/client";
import { postFormSchema, type PostFormData } from "@/lib/schema/post";
import ImageUpload from "../ui/image-upload";
import { useUploadThing } from "@/utils/uploadthing";
import { AppRouter } from "@/trpc/routers/_app";
import { inferRouterOutputs } from "@trpc/server";
import LocationSelector from "./location-selector";

interface PostFormProps {
    post: inferRouterOutputs<AppRouter>["posts"]["getPost"] | null;
}

export default function CreatePostForm({ post }: PostFormProps) {
    const ut = useUploadThing("postUploader");

    const form = useForm<PostFormData>({
        resolver: zodResolver(postFormSchema),
        defaultValues: {
            component: post?.component,
            title: post?.title || "",
            description: post?.description || "",
            location: post?.location,
            price: post?.price || 0,
            images: post?.images || [],
        },
        mode: "onChange",
    });

    const [selectedComponent, setSelectedComponent] = useState<
        ReturnedComponent | undefined
    >(post?.component);
    const create = trpc.posts.createPost.useMutation();
    const edit = trpc.posts.editPost.useMutation();
    const router = useRouter();

    const isLoading =
        form.formState.isSubmitting || create.isPending || edit.isPending;

    useEffect(() => {
        form.reset({
            component: post?.component,
            title: post?.title || "",
            description: post?.description || "",
            location: post?.location,
            price: post?.price || 0,
            images: post?.images || [],
        });
        setSelectedComponent(post?.component);
    }, [post, form]);

    useEffect(() => {
        // warn on page exit/reload if its a post edit and there are unsaved changes
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (post && form.formState.isDirty) e.preventDefault();
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [post, form.formState.isDirty]);

    const onSubmit = async (formData: PostFormData) => {
        let uploadResult;
        if (post) {
            if (formData.images) {
                const newImages = formData.images.filter(
                    (img) => typeof img !== "string"
                );

                if (newImages.length > 0) {
                    try {
                        uploadResult = await ut.startUpload(newImages);
                        if (!uploadResult) {
                            form.setError("images", {
                                message:
                                    "L'upload des images a échoué. Veuillez réessayer.",
                            });
                            return;
                        }
                    } catch (error) {
                        form.setError("images", {
                            message:
                                error instanceof Error
                                    ? error.message
                                    : "Une erreur est survenue lors de l'upload des images.",
                        });
                        return;
                    }
                }
            }

            const images = formData.images
                ? [
                      ...formData.images.filter(
                          (img) => typeof img === "string"
                      ),
                      ...(uploadResult
                          ? uploadResult.map((img) => img.ufsUrl)
                          : []),
                  ]
                : post.images;

            edit.mutate(
                {
                    id: post.id,
                    componentId: formData.component.id,
                    title: formData.title,
                    description: formData.description,
                    location: formData.location,
                    price: formData.price,
                    images: images,
                },
                {
                    onSuccess: (data) => {
                        router.push(`/post/${data.postId}`);
                    },
                    onError: (error) => {
                        form.setError("root", {
                            message: error.message || "Une erreur est survenue",
                        });
                    },
                }
            );
        } else {
            if (formData.images && formData.images.length > 0) {
                try {
                    uploadResult = await ut.startUpload(
                        formData.images as File[]
                    );
                    if (!uploadResult) {
                        form.setError("images", {
                            message:
                                "L'upload des images a échoué. Veuillez réessayer.",
                        });
                        return;
                    }
                } catch (error) {
                    form.setError("images", {
                        message:
                            error instanceof Error
                                ? error.message
                                : "Une erreur est survenue lors de l'upload des images.",
                    });
                    return;
                }
            }

            create.mutate(
                {
                    componentId: formData.component.id,
                    title: formData.title,
                    description: formData.description,
                    location: formData.location,
                    price: formData.price,
                    images: uploadResult
                        ? uploadResult.map((img) => img.ufsUrl)
                        : [],
                },
                {
                    onSuccess: (data) => {
                        router.push(`/post/${data.postId}`);
                    },
                    onError: (error) => {
                        form.setError("root", {
                            message: error.message || "Une erreur est survenue",
                        });
                    },
                }
            );
        }
    };

    return (
        <Card className="w-full border-none shadow-none bg-transparent">
            <CardHeader className="text-center px-0">
                <CardTitle className="text-3xl font-bold">
                    {post ? "Editer une Annonce" : "Créer une Annonce"}
                </CardTitle>
                <CardDescription>
                    {post
                        ? "Éditez votre annonce en quelques clics."
                        : "Mettez en vente vos composants informatiques en quelques clics."}
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-8"
                    >
                        {form.formState.errors.root && (
                            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm text-center">
                                {form.formState.errors.root.message}
                            </div>
                        )}

                        <div className="space-y-6">
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">
                                    1. Quel composant vendez-vous ?
                                </h3>
                                <FormField
                                    control={form.control}
                                    name="component"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <ComponentSelector
                                                    selectedComponent={
                                                        selectedComponent
                                                    }
                                                    setSelectedComponent={(
                                                        component
                                                    ) => {
                                                        setSelectedComponent(
                                                            component
                                                        );
                                                        if (component) {
                                                            form.setValue(
                                                                "price",
                                                                component.price ||
                                                                    form.getValues(
                                                                        "price"
                                                                    )
                                                            );
                                                        }
                                                        field.onChange(
                                                            component
                                                        );
                                                    }}
                                                    errored={
                                                        !!form.formState.errors
                                                            .component
                                                    }
                                                    disabled={isLoading}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">
                                    2. Détails de l&apos;annonce
                                </h3>
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Titre de l&apos;annonce{" "}
                                                <span className="text-destructive">
                                                    *
                                                </span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Ex: Carte Graphique RTX 3080 Excellent état"
                                                    disabled={isLoading}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Description détaillée{" "}
                                                <span className="text-destructive">
                                                    *
                                                </span>
                                            </FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    className="min-h-30 resize-y"
                                                    placeholder="Décrivez l'état du produit, la raison de la vente, etc..."
                                                    disabled={isLoading}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex gap-6 flex-col sm:flex-row items-start">
                                <FormField
                                    control={form.control}
                                    name="price"
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            <FormLabel>
                                                Prix (€){" "}
                                                <span className="text-destructive">
                                                    *
                                                </span>
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        type="number"
                                                        step={0.01}
                                                        min={0}
                                                        aria-invalid={
                                                            !!form.formState
                                                                .errors.price
                                                        }
                                                        placeholder="0.00"
                                                        disabled={isLoading}
                                                        className="pl-8"
                                                        {...field}
                                                        onChange={(e) =>
                                                            field.onChange(
                                                                parseFloat(
                                                                    e.target
                                                                        .value
                                                                ) || 0
                                                            )
                                                        }
                                                    />
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                                        €
                                                    </span>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="location"
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            <FormLabel>
                                                Localisation{" "}
                                                <span className="text-destructive">
                                                    *
                                                </span>
                                            </FormLabel>
                                            <FormControl>
                                                <LocationSelector
                                                    defaultValue={field.value}
                                                    onChange={(location) => {
                                                        field.onChange(
                                                            location
                                                        );
                                                    }}
                                                    disabled={isLoading}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">
                                    3. Photos
                                </h3>
                                <FormField
                                    control={form.control}
                                    name="images"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex justify-between items-center mb-2">
                                                <FormLabel className="text-base">
                                                    Ajouter des photos
                                                </FormLabel>
                                                <span
                                                    className={`text-xs ${form.formState.errors.images ? "text-destructive" : "text-muted-foreground"}`}
                                                >
                                                    {field.value?.length || 0} /
                                                    6
                                                </span>
                                            </div>
                                            <FormControl>
                                                <ImageUpload
                                                    maxImages={6}
                                                    disabled={
                                                        isLoading ||
                                                        (field.value?.length ??
                                                            0) >= 6
                                                    }
                                                    images={field.value || []}
                                                    onChange={(file) =>
                                                        field.onChange(file)
                                                    }
                                                />
                                            </FormControl>
                                            <p className="text-xs text-muted-foreground mt-2">
                                                Ajoutez jusqu&apos;à 6 photos
                                                pour mettre en valeur votre
                                                composant.
                                            </p>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button
                                type="submit"
                                size="lg"
                                loading={isLoading}
                                disabled={
                                    isLoading ||
                                    !form.formState.isValid ||
                                    !form.formState.isDirty
                                }
                                className="w-full font-semibold text-base"
                            >
                                {post
                                    ? "Editer l'annonce"
                                    : "Publier l'annonce"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
