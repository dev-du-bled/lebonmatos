"use client";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { REPORT_TYPE } from "@prisma/client";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { useSession } from "@/components/auth/session-provider";

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
    postId: string;
}

export default function ReportButton({ postId }: ReportButtonProps) {
    const { session } = useSession();
    const [open, setOpen] = useState(false);

    const [selectedType, setSelectedType] = useState<REPORT_TYPE | undefined>(
        undefined
    );
    const [details, setDetails] = useState("");

    const reportTypes = Object.values(REPORT_TYPE);

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
            },
        });

    const handleClose = () => {
        setOpen(false);
        setSelectedType(undefined);
        setDetails("");
    };

    const handleSubmit = () => {
        if (!selectedType) return;
        createReport({
            postId,
            reason: selectedType,
            details: details.trim() || null,
        });
    };

    if (!session) return null;

    return (
        <Dialog
            open={open}
            onOpenChange={(v) => (v ? setOpen(true) : handleClose())}
        >
            <DialogTrigger asChild>
                <Tooltip>
                    {/* need to manually add on click cause seems that ref arent passing down correctly */}
                    <TooltipTrigger asChild onClick={() => setOpen(!open)}>
                        <Button size="icon-sm" className="gap-2">
                            <Flag className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Signaler cette annonce</TooltipContent>
                </Tooltip>
            </DialogTrigger>

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
                        <div className="grid grid-cols-1 gap-2 px-4 pb-4">
                            {reportTypes.map((type) => {
                                const {
                                    label,
                                    description,
                                    icon: Icon,
                                } = reportTypeConfig[type];
                                return (
                                    <Button
                                        key={type}
                                        variant="outline"
                                        className="h-auto py-3 px-3 justify-start gap-4"
                                        onClick={() => setSelectedType(type)}
                                    >
                                        <Icon className="shrink-0 text-muted-foreground" />
                                        <div className="flex flex-col items-start">
                                            <p className="font-medium leading-none">
                                                {label}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {description}
                                            </p>
                                        </div>
                                        <ChevronRight className="hidden xs:block shrink-0 text-muted-foreground ml-1" />
                                    </Button>
                                );
                            })}
                        </div>
                    </>
                ) : (
                    /* details  */
                    <div className="px-4 pb-4 space-y-4">
                        <p className="text-sm text-muted-foreground">
                            {reportTypeConfig[selectedType].description}. <br />
                            Ajoutez des détails supplémentaires si nécessaire.
                        </p>
                        <div className="space-y-2">
                            <Label htmlFor="report-details">
                                Détails{" "}
                                <span className="text-muted-foreground font-normal">
                                    (optionnel)
                                </span>
                            </Label>
                            <Textarea
                                id="report-details"
                                placeholder="Décrivez le problème en quelques mots..."
                                value={details}
                                onChange={(e) => setDetails(e.target.value)}
                                maxLength={500}
                                rows={4}
                                disabled={isPending}
                            />
                            <p className="text-xs text-muted-foreground text-right">
                                {details.length}/500
                            </p>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button
                                variant="outline"
                                onClick={handleClose}
                                disabled={isPending}
                            >
                                Annuler
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={isPending}
                                loading={isPending}
                            >
                                Signaler
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
