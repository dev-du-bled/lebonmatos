"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup } from "@/components/ui/field";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import AuthImage from "@/assets/auth-lateral.jpg";
import Image from "next/image";

const signupSchema = z
  .object({
    name: z.string().min(2, {
      message: "Le nom doit contenir au moins 2 caractères.",
    }),
    email: z.email({
      message: "Veuillez entrer une adresse email valide.",
    }),
    password: z.string().min(6, {
      message: "Le mot de passe doit contenir au moins 6 caractères.",
    }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type SignupFormData = z.infer<typeof signupSchema>;

export function SignupForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      const result = await authClient.signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
      });

      if (result.error) {
        form.setError("root", {
          message:
            result.error.message ||
            "L'inscription a échoué. Veuillez réessayer.",
        });
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      form.setError("root", {
        message: "Une erreur inattendue s'est produite. Veuillez réessayer.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden p-0">
      <CardContent className="grid p-0 md:grid-cols-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8">
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Créer un compte</h1>
                <p className="text-muted-foreground text-balance">
                  Rejoignez une communauté de passionnés et vendez/achetez dès
                  maintenant !
                </p>
              </div>

              {form.formState.errors.root && (
                <div className="text-destructive text-sm text-center">
                  {form.formState.errors.root.message}
                </div>
              )}

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom complet</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Jean Dupont"
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="m@exemple.com"
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
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mot de passe</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        disabled={isLoading}
                        placeholder="********"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmer le mot de passe</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        disabled={isLoading}
                        placeholder="********"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Field>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Création du compte..." : "Créer le compte"}
                </Button>
              </Field>
              <FieldDescription className="text-center">
                Vous avez déjà un compte ? <a href="/login">Se connecter</a>
              </FieldDescription>
            </FieldGroup>
          </form>
        </Form>
        <div className="relative hidden md:block h-full">
          <Image
            src={AuthImage}
            alt="Auth image"
            fill
            className="object-cover"
          />
        </div>
      </CardContent>
    </Card>
  );
}
