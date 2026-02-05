"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
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
import Link from "next/link";

import { loginSchema, type LoginFormData } from "@/lib/schema/auth";
import AlreadyLoggedInRedirect from "./already-loggedin-redirect";

export function LoginForm() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { executeRecaptcha } = useGoogleReCaptcha();
    const searchParams = useSearchParams();
    const redirect = searchParams.get("redirect");
    const form = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (data: LoginFormData) => {
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
                recaptchaToken = await executeRecaptcha("login");
                if (!recaptchaToken) {
                    form.setError("root", {
                        message:
                            "Erreur de vérification reCAPTCHA. Veuillez réessayer.",
                    });
                    return;
                }
            }

            const result = await authClient.signIn.email({
                email: data.email,
                password: data.password,
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
                        "La connexion a échoué. Veuillez réessayer.",
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
                                        Ravi de vous revoir !
                                    </h1>
                                    <p className="text-muted-foreground text-balance">
                                        Connectez-vous à votre compte LeBonMatos
                                        pour accéder à toutes les
                                        fonctionnalités.
                                    </p>
                                </div>

                                {redirect && (
                                    <div className="bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center gap-2 rounded-md p-3 text-sm font-medium">
                                        <Lock className="size-4" />
                                        Cette page nécessite une connexion.
                                    </div>
                                )}

                                {form.formState.errors.root && (
                                    <div className="text-destructive text-sm text-center">
                                        {form.formState.errors.root.message}
                                    </div>
                                )}

                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="email"
                                                    placeholder="michel@lebonmatos.com"
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
                                            <div className="flex items-center">
                                                <FormLabel>
                                                    Mot de passe
                                                </FormLabel>
                                                <Link
                                                    href="#"
                                                    className="ml-auto text-sm underline-offset-2 hover:underline"
                                                    onClick={() =>
                                                        alert("Not implemented")
                                                    }
                                                >
                                                    Mot de passe oublié ?
                                                </Link>
                                            </div>
                                            <FormControl>
                                                <Input
                                                    placeholder="********"
                                                    type="password"
                                                    disabled={isLoading}
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
                                            ? "Connexion..."
                                            : "Se connecter"}
                                    </Button>
                                </Field>
                                <FieldDescription className="text-center">
                                    Vous n&apos;avez pas de compte ?{" "}
                                    <a href="/signup">S&apos;inscrire</a>
                                </FieldDescription>
                            </FieldGroup>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </>
    );
}
