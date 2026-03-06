"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog";

export function DeleteReviewButton({ reviewId }: { reviewId: string }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);

    const deleteMutation = trpc.user.deleteReview.useMutation({
        onSuccess: () => {
            setOpen(false);
            toast.success("Avis supprimé");
            router.refresh();
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la suppression");
        },
    });

    return (
        <>
            <Button
                variant="ghost"
                size="icon-sm"
                className="shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => setOpen(true)}
            >
                <Trash2 className="size-3.5" />
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Supprimer cet avis ?</DialogTitle>
                        <DialogDescription>
                            Cette action est irréversible. Votre avis sera
                            définitivement supprimé.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Annuler</Button>
                        </DialogClose>
                        <Button
                            variant="destructive"
                            onClick={() => deleteMutation.mutate({ reviewId })}
                            loading={deleteMutation.isPending}
                        >
                            Supprimer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
