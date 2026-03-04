"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { trpc } from "@/trpc/client";

type ContentType = "POST" | "REVIEW" | "USER";

const contentDescription: Record<ContentType, string> = {
    POST: "L'annonce associée sera définitivement supprimée.",
    REVIEW: "L'avis associé sera définitivement supprimé.",
    USER: "Aucun contenu ne sera supprimé.",
};

export function ResolveReportDialog({
    reportId,
    contentType,
    onSuccess,
}: {
    reportId: string;
    contentType: ContentType;
    onSuccess: () => void;
}) {
    const resolve = trpc.reports.resolveReport.useMutation({
        onSuccess,
    });

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <DropdownMenuItem
                    disabled={resolve.isPending}
                    onSelect={(e) => e.preventDefault()}
                >
                    Marquer comme traité
                </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Confirmer le traitement</AlertDialogTitle>
                    <AlertDialogDescription>
                        {contentDescription[contentType]} Cette action est
                        irréversible.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => resolve.mutate({ id: reportId })}
                    >
                        Confirmer
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
