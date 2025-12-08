"use client";

import {
    useEffect,
    useState,
} from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { TRPCClientError } from "@trpc/client";
import type { inferRouterOutputs } from "@trpc/server";
import { useForm } from "react-hook-form";
import { ZodError } from "zod";
import { Undo2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
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
    normalizePersonalInfoInput,
    personalInfoFormSchema,
    type PersonalInfoFormValues,
} from "@/lib/schema/user";
import { trpc } from "@/trpc/client";
import type { AppRouter } from "@/trpc/routers/_app";

type UserProfile = inferRouterOutputs<AppRouter>["user"]["getProfile"];

type ProfileEditFormProps = {
    initialData: UserProfile;
};

export function ProfileEditForm({ initialData }: ProfileEditFormProps) {
    const utils = trpc.useUtils();
    const mutation = trpc.user.updatePersonalInfo.useMutation();
    const [snapshot, setSnapshot] = useState<UserProfile>(initialData);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const form = useForm<PersonalInfoFormValues>({
        resolver: zodResolver(personalInfoFormSchema),
        defaultValues: {
            name: initialData.name,
            phoneNumber: initialData.phoneNumber ?? "",
        },
    });

    const resetForm = (profile: UserProfile) => {
        form.reset({
            name: profile.name,
            phoneNumber: profile.phoneNumber ?? "",
        });
    };

    const handleReset = () => {
        setSubmitError(null);
        setSubmitSuccess(false);
        resetForm(snapshot);
    };

    const handleSubmit = async (values: PersonalInfoFormValues) => {
        setSubmitError(null);
        setSubmitSuccess(false);

        try {
            const payload = normalizePersonalInfoInput(values);

            const updated = await mutation.mutateAsync(payload);

            setSnapshot(updated);
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

    const isFormDirty = form.formState.isDirty;
    const canSubmit = isFormDirty && !mutation.isPending;

    return (
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 pb-16 pt-10 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-semibold sm:text-4xl">
                    Informations personnelles
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base">
                    Gérez vos informations privées et vos coordonnées de contact.
                </p>
            </div>
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl">
                        Coordonnées
                    </CardTitle>
                    <CardDescription>
                        Ces informations sont utilisées pour vos transactions et la livraison.
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

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleReset}
                                    disabled={
                                        mutation.isPending || !isFormDirty
                                    }
                                >
                                    <Undo2 className="size-4" />
                                    Réinitialiser
                                </Button>
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
