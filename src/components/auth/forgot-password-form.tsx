"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle } from "lucide-react";
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
    forgotPasswordSchema,
    type ForgotPasswordFormData,
} from "@/lib/schema/auth";

export function ForgotPasswordForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const form = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    });

    const onSubmit = async (data: ForgotPasswordFormData) => {
        setIsLoading(true);
        try {
            await authClient.requestPasswordReset({
                email: data.email,
                redirectTo: "/reset-password",
            });
            setIsSuccess(true);
        } catch {
            setIsSuccess(true);
        } finally {
            setIsLoading(false);
        }
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
                            <div className="flex flex-col items-center gap-2 text-center">
                                <h1 className="text-2xl font-bold">
                                    Mot de passe oublie ?
                                </h1>
                                <p className="text-muted-foreground text-balance">
                                    Entrez votre adresse email et nous vous
                                    enverrons un lien pour reinitialiser votre
                                    mot de passe.
                                </p>
                            </div>

                            {isSuccess && (
                                <div className="bg-green-500/10 text-green-600 dark:text-green-400 flex items-center justify-center gap-2 rounded-md p-3 text-sm font-medium">
                                    <CheckCircle className="size-4" />
                                    Si un compte existe avec cet email, vous
                                    recevrez un lien de reinitialisation.
                                </div>
                            )}

                            {form.formState.errors.root && (
                                <div className="bg-destructive/10 text-destructive flex items-center justify-center gap-2 rounded-md p-3 text-sm font-medium">
                                    <AlertCircle className="size-4" />
                                    {form.formState.errors.root.message}
                                </div>
                            )}

                            {!isSuccess && (
                                <>
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

                                    <Field>
                                        <Button
                                            type="submit"
                                            disabled={isLoading}
                                        >
                                            {isLoading
                                                ? "Envoi en cours..."
                                                : "Envoyer le lien"}
                                        </Button>
                                    </Field>
                                </>
                            )}

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
