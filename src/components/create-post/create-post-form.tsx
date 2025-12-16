"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
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
import { Components, ReturnedComponent } from "@/utils/components";
import { trpc } from "@/trpc/client";
import ImageUpload from "../ui/image-upload";
import { FileToBase64 } from "@/utils/file";
import { postFormSchema, type PostFormData } from "@/lib/schema/post";

export default function CreatePostForm() {
    const form = useForm<PostFormData>({
        resolver: zodResolver(postFormSchema),
        defaultValues: {
            component: undefined,
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
        const images = await Promise.all(
            formData.images?.map(async (file) => {
                return FileToBase64(file);
            }) || []
        );

        mutation.mutate(
            {
                componentId: formData.component.id,
                title: formData.component.name,
                description: formData.description,
                location: formData.location,
                price: formData.price,
                images: images.map((data, index) => ({
                    data,
                    alt:
                        formData.images?.[index]?.name ||
                        `${formData.component?.name} image ${index + 1}`,
                })),
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
                                                {field.value?.length || 0} / 6
                                            </span>
                                        </div>
                                        <FormControl>
                                            <ImageUpload
                                                images={field.value || []}
                                                onChange={(files) => {
                                                    field.onChange(files);
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Field>
                                <Button
                                    type="submit"
                                    disabled={mutation.isPending}
                                    className="w-full"
                                >
                                    {mutation.isPending
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
