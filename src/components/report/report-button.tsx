"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Flag,
    ChevronRight,
    AlertTriangle,
    MessageSquareWarning,
    ShieldAlert,
    BadgeDollarSign,
    MoreHorizontal,
    type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { TextareaWithCount } from "@/components/ui/textarea-with-count";
import { Label } from "@/components/ui/label";
import { REPORT_TYPE } from "@prisma/client";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { useSession } from "@/components/auth/session-provider";
import {
    createReportSchema,
    type CreateReportInput,
} from "@/lib/schema/report";

const reportTypeConfig: Record<
    REPORT_TYPE,
    { label: string; description: string; icon: LucideIcon }
> = {
    SPAM: {
        label: "Spam",
        description: "Contenu répétitif ou non sollicité",
        icon: MessageSquareWarning,
    },
    INNAPPROPRIATE: {
        label: "Contenu inapproprié",
        description: "Contenu offensant ou choquant",
        icon: AlertTriangle,
    },
    HARASSMENT: {
        label: "Harcèlement",
        description: "Comportement abusif ou menaçant",
        icon: ShieldAlert,
    },
    SCAM: {
        label: "Arnaque",
        description: "Tentative de fraude ou d'escroquerie",
        icon: BadgeDollarSign,
    },
    OTHER: {
        label: "Autre",
        description: "Une autre raison non listée",
        icon: MoreHorizontal,
    },
};

interface ReportButtonProps {
    type: "POST" | "USER" | "REVIEW";
    width: "full" | "icon";
    reportedId: string;
    userId?: string; // userId props to hidde button if users try to report themselves, their own post or review
    tooltipText?: string;
    isSold?: boolean;
}

export default function ReportButton({
    type,
    width,
    reportedId,
    userId,
    tooltipText,
    isSold,
}: ReportButtonProps) {
    const { session } = useSession();
    const [open, setOpen] = useState(false);
    const [selectedType, setSelectedType] = useState<REPORT_TYPE | undefined>(
        undefined
    );

    const reportTypes = Object.values(REPORT_TYPE);

    const {
        formState: { isValid, errors },
        register,
        handleSubmit,
        setValue,
        reset,
    } = useForm<CreateReportInput>({
        resolver: zodResolver(createReportSchema),
        mode: "onChange",
        defaultValues: {
            type,
            reportedId,
            reason: undefined,
            details: null,
        },
    });

    const { mutate: createReport, isPending } =
        trpc.reports.createReport.useMutation({
            onSuccess: () => {
                toast.success("Signalement envoyé", {
                    description:
                        "Merci, nous avons bien reçu votre signalement.",
                });
                handleClose();
            },
            onError: (error) => {
                toast.error("Erreur", {
                    description:
                        error.data?.code === "CONFLICT"
                            ? "Vous avez déjà signalé cette annonce."
                            : (error.message ??
                              "Une erreur est survenue. Réessayez."),
                });
                handleClose();
            },
        });

    const handleClose = () => {
        setOpen(false);
        setSelectedType(undefined);
        reset({
            type,
            reportedId,
            reason: undefined,
            details: null,
        });
    };

    const handleSelectType = (type: REPORT_TYPE) => {
        setSelectedType(type);
        setValue("reason", type, { shouldValidate: true });
    };

    const onSubmit = (data: CreateReportInput) => {
        createReport({
            ...data,
            details: data.details?.trim() || null,
        });
    };

    if (!session || session.user?.id === userId || isSold) return null;

    return (
        <Dialog
            open={open}
            onOpenChange={(v) => (v ? setOpen(true) : handleClose())}
        >
            <Tooltip>
                <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                        <Button
                            size={width === "full" ? "default" : "icon-sm"}
                            className="gap-2"
                        >
                            <Flag className="h-4 w-4" />
                            {width === "full" && "Signaler"}
                        </Button>
                    </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent>
                    {tooltipText || "Signaler cette annonce"}
                </TooltipContent>
            </Tooltip>

            <DialogContent className="sm:max-w-md p-0 gap-0">
                <DialogHeader className="px-4 pt-4 pb-2">
                    <DialogTitle>
                        {selectedType ? (
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 -ml-2"
                                    onClick={() => setSelectedType(undefined)}
                                    disabled={isPending}
                                >
                                    <ChevronRight className="h-4 w-4 rotate-180" />
                                    Retour
                                </Button>
                                <span className="text-muted-foreground">|</span>
                                {reportTypeConfig[selectedType].label}
                            </div>
                        ) : (
                            "Signaler cette annonce"
                        )}
                    </DialogTitle>
                </DialogHeader>

                {/* type */}
                {!selectedType ? (
                    <>
                        <p className="text-sm text-muted-foreground px-4 pb-3">
                            Pourquoi souhaitez-vous signaler cette annonce ?
                        </p>
                        <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 px-4 pb-4">
                            {reportTypes.map((type, index) => {
                                const {
                                    label,
                                    description,
                                    icon: Icon,
                                } = reportTypeConfig[type];
                                const lastSpan =
                                    index === reportTypes.length - 1 &&
                                    reportTypes.length % 2 !== 0;
                                return (
                                    <Button
                                        key={type}
                                        variant="outline"
                                        className={`h-19 py-3 px-3 flex flex-col items-start justify-center text-left${lastSpan ? " xs:col-span-2" : ""}`}
                                        onClick={() => handleSelectType(type)}
                                    >
                                        <Icon className="shrink-0 text-muted-foreground mr-2" />
                                        <div className="flex flex-col">
                                            <p className="font-medium leading-none">
                                                {label}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1 text-wrap">
                                                {description}
                                            </p>
                                        </div>
                                    </Button>
                                );
                            })}
                        </div>
                    </>
                ) : (
                    /* details */
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="px-4 pb-4 space-y-4"
                    >
                        <p className="text-sm text-muted-foreground">
                            {reportTypeConfig[selectedType].description}.{" "}
                            {selectedType === "OTHER"
                                ? "Veuillez préciser la raison dans le champ ci-dessous."
                                : "Ajoutez des détails supplémentaires si nécessaire."}
                        </p>
                        <div className="space-y-2">
                            <Label htmlFor="report-details">
                                Détails{" "}
                                {selectedType === "OTHER" ? (
                                    <span className="text-destructive font-normal">
                                        (obligatoire)
                                    </span>
                                ) : (
                                    <span className="text-muted-foreground font-normal">
                                        (optionnel)
                                    </span>
                                )}
                            </Label>
                            <TextareaWithCount
                                id="report-details"
                                placeholder="Décrivez le problème en quelques mots..."
                                {...register("details")}
                                onChange={(e) =>
                                    setValue("details", e.target.value, {
                                        shouldValidate: true,
                                    })
                                }
                                rows={4}
                                maxLength={500}
                                disabled={isPending}
                                aria-invalid={!!errors.details}
                                error={errors.details?.message}
                            />
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                disabled={isPending}
                            >
                                Annuler
                            </Button>
                            <Button
                                type="submit"
                                disabled={isPending || !isValid}
                                loading={isPending}
                            >
                                Signaler
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
