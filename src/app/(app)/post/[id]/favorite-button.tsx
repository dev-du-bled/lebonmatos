"use client";

import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import { Heart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface FavoritePostProps {
    postId: string;
    isFavorited: boolean;
    className?: string;
}

export default function FavoriteButton({
    postId,
    isFavorited,
    className,
}: FavoritePostProps) {
    const [isFavorite, setIsFavorite] = useState(isFavorited);
    const favMutation = trpc.posts.favoritePost.useMutation();

    const toggleFavorite = async () => {
        try {
            const { favorited } = await favMutation.mutateAsync({
                postId: postId,
            });
            setIsFavorite(favorited);
        } catch {
            toast.error(
                `Une erreur est survenue lors de la mise en favori de l'annonce.`
            );
        }
    };

    return (
        <Button
            size="icon-sm"
            onClick={toggleFavorite}
            className={className}
            loading={favMutation.isPending}
            disabled={favMutation.isPending}
        >
            <Heart fill={isFavorite ? "black" : "none"} />
        </Button>
    );
}
