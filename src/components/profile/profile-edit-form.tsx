"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { TRPCClientError } from "@trpc/client";
import type { inferRouterOutputs } from "@trpc/server";
import { useForm } from "react-hook-form";
import { ZodError } from "zod";
import { Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    personalInfoFormSchema,
    changePasswordSchema,
    type PersonalInfoFormValues,
    type ChangePasswordValues,
} from "@/lib/schema/user";
import { trpc } from "@/trpc/client";
import type { AppRouter } from "@/trpc/routers/_app";
import { authClient } from "@/lib/auth-client";

type UserProfile = inferRouterOutputs<AppRouter>["user"]["getProfile"];

type ProfileEditFormProps = {
    initialData: UserProfile;
};

export function ProfileEditForm({ initialData }: ProfileEditFormProps) {
    const utils = trpc.useUtils();
    const mutation = trpc.user.updatePersonalInfo.useMutation();
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    // Password Dialog State
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const form = useForm<PersonalInfoFormValues>({
        resolver: zodResolver(personalInfoFormSchema),
        defaultValues: {
            name: initialData.name,
            email: initialData.email,
            phoneNumber: initialData.phoneNumber ?? "",
        },
    });

    const passwordForm = useForm<ChangePasswordValues>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    const resetForm = (profile: UserProfile) => {
        form.reset({
            name: profile.name,
            email: profile.email,
            phoneNumber: profile.phoneNumber ?? "",
        });
    };

    const handleSubmit = async (values: PersonalInfoFormValues) => {
        setSubmitError(null);
        setSubmitSuccess(false);

        try {
            const updated = await mutation.mutateAsync(values);

            utils.user.getProfile.setData(undefined, updated);
            resetForm(updated);
            setSubmitSuccess(true);
        } catch (error) {
            if (error instanceof TRPCClientError) {
                setSubmitError(error.message);
                return;
            }

            if (error instanceof ZodError) {
                setSubmitError(
                    error.issues[0]?.message ?? "Erreur de validation"
                );
                return;
            }

            setSubmitError("Une erreur inattendue est survenue.");
        }
    };

    const onPasswordSubmit = async (values: ChangePasswordValues) => {
        setPasswordError(null);
        setPasswordSuccess(false);
        setIsChangingPassword(true);
        try {
            const { error } = await authClient.changePassword({
                newPassword: values.newPassword,
                currentPassword: values.currentPassword,
                revokeOtherSessions: true,
            });
            if (error) {
                setPasswordError(
                    error.message || "Erreur lors du changement de mot de passe"
                );
                return;
            }
            setPasswordSuccess(true);
            passwordForm.reset();
            setTimeout(() => {
                setIsPasswordDialogOpen(false);
                setPasswordSuccess(false);
            }, 2000);
        } catch {
            setPasswordError("Une erreur inattendue est survenue");
        } finally {
            setIsChangingPassword(false);
        }
    };

    const isFormDirty = form.formState.isDirty;
    const canSubmit = isFormDirty && !mutation.isPending;

    return (
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 pb-16 pt-10 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-semibold sm:text-4xl">
                    Informations personnelles
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base">
                    Gérez vos informations privées et vos coordonnées de
                    contact.
                </p>
            </div>
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl">Coordonnées</CardTitle>
                    <CardDescription>
                        Ces informations sont utilisées pour vos transactions et
                        la livraison.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(handleSubmit)}
                            className="flex flex-col gap-6"
                        >
                            <div className="grid gap-6 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Nom complet (Légal)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Prénom Nom"
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
                                                    placeholder="exemple@email.com"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="phoneNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Téléphone</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="+33 6 12 34 56 78"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {submitError && (
                                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                                    {submitError}
                                </div>
                            )}
                            {submitSuccess && !submitError && (
                                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                                    Informations mises à jour avec succès.
                                </div>
                            )}

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <Dialog
                                    open={isPasswordDialogOpen}
                                    onOpenChange={setIsPasswordDialogOpen}
                                >
                                    <DialogTrigger asChild>
                                        <Button variant="outline" type="button">
                                            <Lock className="mr-2 size-4" />
                                            Changer le mot de passe
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>
                                                Changer le mot de passe
                                            </DialogTitle>
                                            <DialogDescription>
                                                Entrez votre mot de passe actuel
                                                et le nouveau mot de passe.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <Form {...passwordForm}>
                                            <form
                                                onSubmit={passwordForm.handleSubmit(
                                                    onPasswordSubmit
                                                )}
                                                className="space-y-4"
                                            >
                                                <FormField
                                                    control={
                                                        passwordForm.control
                                                    }
                                                    name="currentPassword"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>
                                                                Mot de passe
                                                                actuel
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="password"
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={
                                                        passwordForm.control
                                                    }
                                                    name="newPassword"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>
                                                                Nouveau mot de
                                                                passe
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="password"
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={
                                                        passwordForm.control
                                                    }
                                                    name="confirmPassword"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>
                                                                Confirmer le mot
                                                                de passe
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="password"
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                {passwordError && (
                                                    <div className="text-sm text-destructive">
                                                        {passwordError}
                                                    </div>
                                                )}
                                                {passwordSuccess && (
                                                    <div className="text-sm text-emerald-600">
                                                        Mot de passe modifié
                                                        avec succès.
                                                    </div>
                                                )}
                                                <DialogFooter>
                                                    <Button
                                                        type="submit"
                                                        loading={
                                                            isChangingPassword
                                                        }
                                                    >
                                                        Mettre à jour
                                                    </Button>
                                                </DialogFooter>
                                            </form>
                                        </Form>
                                    </DialogContent>
                                </Dialog>

                                <Button
                                    type="submit"
                                    disabled={!canSubmit}
                                    loading={mutation.isPending}
                                >
                                    Enregistrer
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}

export default ProfileEditForm;
