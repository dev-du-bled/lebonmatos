"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { TRPCClientError } from "@trpc/client";

import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
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
} from "../ui/alert-dialog";
import { useSession } from "../auth/session-provider";
import { trpc } from "@/trpc/client";

interface PostButtonsProps {
    postId: string;
    sellerId: string;
}

type BuyButtonsProps = PostButtonsProps & {
    price: number;
    isSold: boolean;
};

export function ContactButton({ postId, sellerId }: PostButtonsProps) {
    const { session } = useSession();
    const router = useRouter();

    const getOrCreate = trpc.discussions.getOrCreate.useMutation({
        onSuccess: ({ discussionId }) => {
            router.push(`/messages/${discussionId}`);
        },
        onError: () => {
            toast.error("Une erreur est survenue. Veuillez réessayer.");
        },
    });

    if (!session?.user) return null;
    if (session.user.id === sellerId) return null;

    return (
        <Button onClick={() => getOrCreate.mutate({ postId, sellerId })} loading={getOrCreate.isPending}>
            Contacter
        </Button>
    );
}

export function BuyButtons({ postId, sellerId, price, isSold }: BuyButtonsProps) {
    const { session } = useSession();
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);
    const [open, setOpen] = useState(false);

    const mutation = trpc.posts.buyPost.useMutation();

    const getOrCreateOffer = trpc.discussions.getOrCreate.useMutation({
        onSuccess: ({ discussionId }) => {
            router.push(`/messages/${discussionId}?offer=true`);
        },
        onError: () => {
            toast.error("Une erreur est survenue. Veuillez réessayer.");
        },
    });

    if (!session?.user) return null;
    if (session.user.id === sellerId) return null;

    async function handleBuy() {
        setIsPending(true);
        try {
            await mutation.mutateAsync({ postId });
            setOpen(false);
            toast.success("Achat effectué avec succès !");
            router.refresh();
        } catch (error) {
            setOpen(false);
            if (error instanceof TRPCClientError) {
                toast.error(error.message);
            } else {
                toast.error("Une erreur est survenue. Veuillez réessayer.");
            }
        } finally {
            setIsPending(false);
        }
    }

    return (
        <Card className="gap-3">
            <CardHeader>
                <CardTitle>Intéressé ?</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
                {isSold ? (
                    <p className="text-sm text-center text-muted-foreground font-medium py-1">
                        Cette annonce a déjà été vendue.
                    </p>
                ) : (
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => getOrCreateOffer.mutate({ postId, sellerId })}
                            loading={getOrCreateOffer.isPending}
                        >
                            Faire une offre
                        </Button>

                        <AlertDialog
                            open={open}
                            onOpenChange={(v) => {
                                if (!isPending) setOpen(v);
                            }}
                        >
                            <AlertDialogTrigger asChild>
                                <Button className="flex-1" onClick={() => setOpen(true)}>
                                    Acheter
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Confirmer l&apos;achat</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Vous êtes sur le point d&apos;acheter cet article pour{" "}
                                        <span className="font-semibold text-foreground">
                                            {price.toLocaleString("fr-FR")} €
                                        </span>
                                        . Cette action est irréversible.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel disabled={isPending}>Annuler</AlertDialogCancel>
                                    <AlertDialogAction disabled={isPending} onClick={handleBuy}>
                                        {isPending ? (
                                            <>
                                                <Loader2 className="size-4 animate-spin" />
                                                Achat en cours...
                                            </>
                                        ) : (
                                            "Confirmer l'achat"
                                        )}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
