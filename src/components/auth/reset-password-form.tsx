"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
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

import {
    resetPasswordSchema,
    type ResetPasswordFormData,
} from "@/lib/schema/auth";

export function ResetPasswordForm() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const form = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            newPassword: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (data: ResetPasswordFormData) => {
        if (!token) {
            form.setError("root", {
                message: "Token de reinitialisation manquant.",
            });
            return;
        }

        setIsLoading(true);
        try {
            const result = await authClient.resetPassword({
                newPassword: data.newPassword,
                token,
            });

            if (result.error) {
                form.setError("root", {
                    message:
                        "Le lien de reinitialisation est invalide ou a expire. Veuillez en demander un nouveau.",
                });
            } else {
                router.push("/login?passwordReset=true");
            }
        } catch {
            form.setError("root", {
                message:
                    "Une erreur inattendue s'est produite. Veuillez reessayer.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <Card className="overflow-hidden p-0">
                <CardContent className="p-6 md:p-8">
                    <FieldGroup>
                        <div className="flex flex-col items-center gap-2 text-center">
                            <h1 className="text-2xl font-bold">
                                Lien invalide
                            </h1>
                            <p className="text-muted-foreground text-balance">
                                Ce lien de reinitialisation est invalide ou a
                                expire.
                            </p>
                        </div>
                        <FieldDescription className="text-center">
                            <Link href="/forgot-password">
                                Demander un nouveau lien
                            </Link>
                        </FieldDescription>
                    </FieldGroup>
                </CardContent>
            </Card>
        );
    }

    return (
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
                                    Nouveau mot de passe
                                </h1>
                                <p className="text-muted-foreground text-balance">
                                    Choisissez un nouveau mot de passe pour
                                    votre compte.
                                </p>
                            </div>

                            {form.formState.errors.root && (
                                <div className="bg-destructive/10 text-destructive flex items-center justify-center gap-2 rounded-md p-3 text-sm font-medium">
                                    <AlertCircle className="size-4" />
                                    {form.formState.errors.root.message}
                                </div>
                            )}

                            <FormField
                                control={form.control}
                                name="newPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Nouveau mot de passe
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="********"
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
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Confirmer le mot de passe
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="********"
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
                                        ? "Reinitialisation..."
                                        : "Reinitialiser le mot de passe"}
                                </Button>
                            </Field>

                            <FieldDescription className="text-center">
                                <Link href="/login">Retour a la connexion</Link>
                            </FieldDescription>
                        </FieldGroup>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
