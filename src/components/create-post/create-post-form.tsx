"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { FieldGroup, Field } from "../ui/field";
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

export default function CreatePostForm() {
    const ut = useUploadThing("postUploader");

    const form = useForm<PostFormData>({
        resolver: zodResolver(postFormSchema),
        defaultValues: {
            component: undefined,
            title: "",
            description: "",
            location: "",
            price: 0,
            images: [],
        },
    });

    const [selectedComponent, setSelectedComponent] = useState<
        ReturnedComponent | undefined
    >(undefined);
    const mutation = trpc.posts.createPost.useMutation();
    const router = useRouter();

    const onSubmit = async (formData: PostFormData) => {
        let uploadResult;
        if (formData.images && formData.images.length > 0) {
            uploadResult = await ut.startUpload(formData.images);
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
    };

    return (
        <Card className="overflow-hidden p-0">
            <CardContent className="p-0">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="p-6 md:p-8"
                    >
                        <FieldGroup>
                            <h1 className="text-2xl font-bold text-center">
                                Créer une Annonce
                            </h1>

                            {form.formState.errors.root && (
                                <div className="text-destructive text-sm text-center">
                                    <span>
                                        {form.formState.errors.root.message}
                                    </span>
                                </div>
                            )}

                            <FormField
                                control={form.control}
                                name="component"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Composant
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </FormLabel>
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
                                                    form.setValue(
                                                        "price",
                                                        component?.price ||
                                                            form.getValues(
                                                                "price"
                                                            )
                                                    );
                                                    field.onChange(component);
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

                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Titre
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Titre de mon annonce"
                                                disabled={mutation.isPending}
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
                                            Description
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                className="min-h-40 max-h-80"
                                                placeholder="Description de mon super composant"
                                                disabled={mutation.isPending}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="location"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Location</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Paris 75000"
                                                disabled={mutation.isPending}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Prix (€)
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step={0.01}
                                                min={0}
                                                disabled={mutation.isPending}
                                                {...field}
                                                onChange={(e) =>
                                                    // make it a number cause input type number returns string 🤡
                                                    field.onChange(
                                                        parseFloat(
                                                            e.target.value
                                                        ) || 0
                                                    )
                                                }
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="images"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex gap-2">
                                            <FormLabel>Images</FormLabel>
                                            <span
                                                className={`text-xs ${
                                                    form.formState.errors.images
                                                        ? "text-destructive"
                                                        : "text-muted-foreground"
                                                }`}
                                            >
                                                {field.value?.length} / 6
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
                                                images={field.value || []}
                                                onChange={(file) =>
                                                    field.onChange(file)
                                                }
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Field>
                                <Button
                                    type="submit"
                                    disabled={form.formState.isSubmitting}
                                    className="w-full"
                                >
                                    {form.formState.isSubmitting
                                        ? "Création..."
                                        : "Créer"}
                                </Button>
                            </Field>
                        </FieldGroup>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
