"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

type BuyButtonsProps = {
    postId: string;
    price: number;
    isSold: boolean;
};

export function BuyButtons({ postId, price, isSold }: BuyButtonsProps) {
    const { session } = useSession();
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);
    const [open, setOpen] = useState(false);

    const mutation = trpc.posts.buyPost.useMutation();

    const user = session?.user;

    if (!user) return null;

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
                        <Link href="#" className="flex-1">
                            <Button
                                variant="outline"
                                className="w-full"
                                disabled={isSold}
                            >
                                Faire une offre
                            </Button>
                        </Link>

                        <AlertDialog
                            open={open}
                            onOpenChange={(v) => {
                                if (!isPending) setOpen(v);
                            }}
                        >
                            <AlertDialogTrigger asChild>
                                <Button
                                    className="flex-1"
                                    disabled={isSold}
                                    onClick={() => setOpen(true)}
                                >
                                    Acheter
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        Confirmer l&apos;achat
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Vous êtes sur le point d&apos;acheter
                                        cet article pour{" "}
                                        <span className="font-semibold text-foreground">
                                            {price.toLocaleString("fr-FR")} €
                                        </span>
                                        . Cette action est irréversible.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel disabled={isPending}>
                                        Annuler
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        disabled={isPending}
                                        onClick={handleBuy}
                                    >
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

export function ContactButton() {
    const { session } = useSession();

    const user = session?.user;

    if (user) {
        return (
            <Link href="#">
                <Button>Contacter</Button>
            </Link>
        );
    }
}
