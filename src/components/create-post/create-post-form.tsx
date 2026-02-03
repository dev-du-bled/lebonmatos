"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { Loader2 } from "lucide-react";
import { Component, Post } from "@prisma/client";

interface PostFormProps {
    post: (Post & { component: Component }) | null;
}

export default function CreatePostForm({ post }: PostFormProps) {
    const ut = useUploadThing("postUploader");

    const form = useForm<PostFormData>({
        resolver: zodResolver(postFormSchema),
        defaultValues: {
            component: post?.component,
            title: post?.title,
            description: post?.description ? post.description : undefined,
            location: post?.location ? post.location : undefined,
            price: post?.price,
            images: post?.images,
        },
    });

    const [selectedComponent, setSelectedComponent] = useState<
        ReturnedComponent | undefined
    >(undefined);
    const mutation = trpc.posts.createPost.useMutation();
    const router = useRouter();

    const onSubmit = async (formData: PostFormData) => {
        let uploadResult;
        if (post) {
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

            mutation.mutate(
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
                    Créer une Annonce
                </CardTitle>
                <CardDescription>
                    Mettez en vente vos composants informatiques en quelques
                    clics.
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
                                                    disabled={
                                                        mutation.isPending
                                                    }
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
                                                    disabled={
                                                        mutation.isPending
                                                    }
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
                                                        disabled={
                                                            mutation.isPending
                                                        }
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
                                            <FormLabel>Localisation</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Ville ou Code Postal"
                                                    disabled={
                                                        mutation.isPending
                                                    }
                                                    {...field}
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
                                                    variant="dropzone"
                                                    maxImages={6}
                                                    disabled={
                                                        form.formState
                                                            .isSubmitting ||
                                                        (field.value?.length ??
                                                            0) >= 6
                                                    }
                                                    images={
                                                        (field.value as
                                                            | File[]
                                                            | string[]) || []
                                                    }
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
                                disabled={form.formState.isSubmitting}
                                className="w-full font-semibold text-base"
                            >
                                {form.formState.isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {post
                                            ? "Edition en cours..."
                                            : "Publication en cours..."}
                                    </>
                                ) : post ? (
                                    "Editer l'annonce"
                                ) : (
                                    "Publier l'annonce"
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
