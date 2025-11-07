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

export default function CreatePostForm() {
  const postSchema = z.object({
    component: z.custom<Components>((value) => value !== undefined, {
      error: "Vous devez sélectionner un composant",
    }),
    description: z
      .string()
      .min(20, {
        error: "La description doit contenir au moins 20 cartactères",
      })
      .max(1500, {
        error: "La description doit contenir au plus 1500 caractères",
      }),
    price: z.number().min(0, {
      message: "Le prix doit être un nombre positif",
    }),
  });

  type PostFormData = z.infer<typeof postSchema>;

  const form = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      component: undefined,
      description: "",
      price: 0,
    },
  });

  const [selectedComponent, setSelectedComponent] = useState<
    ReturnedComponent | undefined
  >(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (data: PostFormData) => {
    setIsLoading(true);
    // try {
    //   const result = await authClient.signIn.email({});
    //   if (result.error) {
    //     form.setError("root", {
    //       message:
    //         result.error.message ||
    //         "La création de l'annonce à échoué. Veuillez réessayer.",
    //     });
    //   } else {
    //     router.push(`/posts/${result.postId}`);
    //   }
    // } catch {
    //   form.setError("root", {
    //     message: "Une erreur inattendue s'est produite. Veuillez réessayer.",
    //   });
    // } finally {
    //   setIsLoading(false);
    // }
  };

  return (
    <Card className="overflow-hidden p-0">
      <CardContent className="p-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8">
            <FieldGroup>
              <h1 className="text-2xl font-bold text-center">
                Créer une Annonce
              </h1>

              {form.formState.errors.root && (
                <div className="text-destructive text-sm text-center">
                  {form.formState.errors.root.message && (
                    <span>{form.formState.errors.root.message}</span>
                  )}
                </div>
              )}

              <FormField
                control={form.control}
                name="component"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Composant</FormLabel>
                    <FormControl>
                      <ComponentSelector
                        selectedComponent={selectedComponent}
                        setSelectedComponent={(component) => {
                          setSelectedComponent(component);
                          field.onChange(component);
                        }}
                        errored={!!form.formState.errors.component}
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
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        className="min-h-40 max-h-80"
                        placeholder="Description de mon super composant"
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
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prix</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step={0.01}
                        min={0}
                        disabled={isLoading}
                        {...field}
                        onChange={(e) =>
                          // make it a number  cause input type number returns string 🤡
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* TODO: file upload */}

              <Field>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Création..." : "Créer"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
