"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "../ui/button";
import { useSession } from "../auth/session-provider";
import { trpc } from "@/trpc/client";

interface PostButtonsProps {
    postId: string;
    sellerId: string;
    isSold?: boolean;
}

export function ContactButton({
    postId,
    sellerId,
    isSold,
    className,
}: PostButtonsProps & { className?: string }) {
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
            className={className}
            onClick={() => getOrCreate.mutate({ postId, sellerId })}
            loading={getOrCreate.isPending}
            disabled={isSold}
        >
            Contacter
        </Button>
    );
}

export function OfferButton({
    postId,
    sellerId,
    isSold,
    className,
}: PostButtonsProps & { className?: string }) {
    const { session } = useSession();
    const router = useRouter();

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
        <Button
            variant="outline"
            className={className}
            onClick={() => getOrCreateOffer.mutate({ postId, sellerId })}
            loading={getOrCreateOffer.isPending}
            disabled={isSold}
        >
            Faire une offre
        </Button>
    );
}
