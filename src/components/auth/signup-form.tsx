"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
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
import { signupSchema, type SignupFormData } from "@/lib/schema/auth";
import AlreadyLoggedInRedirect from "./already-loggedin-redirect";

export function SignupForm() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get("redirect");
    const { executeRecaptcha } = useGoogleReCaptcha();

    const form = useForm<SignupFormData>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            name: "",
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (data: SignupFormData) => {
        setIsLoading(true);
        try {
            const isProd = process.env.NODE_ENV === "production";
            let recaptchaToken: string | null = null;
            if (isProd) {
                // Executer le captcha en prod car sinon Eden ne peut pas utiliser le formulaire 💀 🥀
                if (!executeRecaptcha) {
                    form.setError("root", {
                        message:
                            "reCAPTCHA n'est pas disponible. Veuillez réessayer.",
                    });
                    return;
                }
                recaptchaToken = await executeRecaptcha("signup");
                if (!recaptchaToken) {
                    form.setError("root", {
                        message:
                            "Erreur de vérification reCAPTCHA. Veuillez réessayer.",
                    });
                    return;
                }
            }

            const result = await authClient.signUp.email({
                email: data.email,
                password: data.password,
                username: data.username,
                name: data.name,
                fetchOptions: {
                    headers: {
                        "x-captcha-response": recaptchaToken ?? "",
                    },
                },
            });

            if (result.error) {
                form.setError("root", {
                    message:
                        result.error.message ||
                        "L'inscription a échoué. Veuillez réessayer.",
                });
            } else {
                router.push(redirect || "/");
                router.refresh();
            }
        } catch {
            form.setError("root", {
                message:
                    "Une erreur inattendue s'est produite. Veuillez réessayer.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <AlreadyLoggedInRedirect />
            <Card className="overflow-hidden p-0">
                <CardContent className="p-0">
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="p-6 md:p-8"
                        >
                            <FieldGroup>
                                <div className="flex flex-col items-center gap-2 text-center">
                                    <h1 className="text-2xl font-bold">
                                        Créer un compte
                                    </h1>
                                    <p className="text-muted-foreground text-balance">
                                        Rejoignez une communauté de passionnés
                                        et vendez/achetez dès maintenant !
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
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Nom d&apos;utilisateur
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="text"
                                                    placeholder="jean_dupont78"
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
                                            <FormLabel>
                                                Confirmer le mot de passe
                                            </FormLabel>
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
                                        {isLoading
                                            ? "Création du compte..."
                                            : "Créer le compte"}
                                    </Button>
                                </Field>
                                <FieldDescription className="text-center">
                                    Vous avez déjà un compte ?{" "}
                                    <a
                                        href={
                                            redirect
                                                ? `/login?redirect=${encodeURIComponent(redirect)}`
                                                : "/login"
                                        }
                                    >
                                        Se connecter
                                    </a>
                                </FieldDescription>
                            </FieldGroup>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </>
    );
}
