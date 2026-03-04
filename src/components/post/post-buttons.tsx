"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useSession } from "../auth/session-provider";
import { trpc } from "@/trpc/client";

interface PostButtonsProps {
    postId: string;
    sellerId: string;
    isSold?: boolean;
}

export function ContactButton({ postId, sellerId, isSold }: PostButtonsProps) {
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
        <Button
            onClick={() => getOrCreate.mutate({ postId, sellerId })}
            loading={getOrCreate.isPending}
            disabled={isSold}
        >
            Contacter
        </Button>
    );
}

export function BuyButtons({ postId, sellerId, isSold }: PostButtonsProps) {
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

    return (
        <Card className="gap-3">
            <CardHeader>
                <CardTitle>{isSold ? "Vendu" : "Intéressé ?"}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() =>
                            getOrCreateOffer.mutate({ postId, sellerId })
                        }
                        loading={getOrCreateOffer.isPending}
                        disabled={isSold}
                    >
                        Faire une offre
                    </Button>
                    <Button
                        className="flex-1"
                        onClick={() => getOrCreate.mutate({ postId, sellerId })}
                        loading={getOrCreate.isPending}
                        disabled={isSold}
                    >
                        Acheter
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
