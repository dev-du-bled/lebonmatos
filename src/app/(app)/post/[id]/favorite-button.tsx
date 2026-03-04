"use client";

import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { trpc } from "@/trpc/client";
import { Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSession } from "@/components/auth/session-provider";

interface FavoritePostProps {
    post: {
        id: string;
        isFavorited?: boolean;
        seller?: {
            id: string;
        };
    };
    className?: string;
}

export default function FavoriteButton({ post, className }: FavoritePostProps) {
    const { session, isPending } = useSession();
    const router = useRouter();
    const [isFavorite, setIsFavorite] = useState(post.isFavorited ?? false);
    const favMutation = trpc.posts.favoritePost.useMutation();

    useEffect(() => {
        if (!isPending && !session) {
            setIsFavorite(false);
        }
    }, [session, isPending]);

    const toggleFavorite = async () => {
        if (!session) {
            toast.error("Vous devez être connecté pour ajouter aux favoris");
            router.push("/login");
            return;
        }

        try {
            const { favorited } = await favMutation.mutateAsync({
                postId: post.id,
            });
            setIsFavorite(favorited);
        } catch {
            toast.error(
                `Une erreur est survenue lors de la mise en favori de l'annonce.`
            );
        }
    };

    if (!session || (post.seller?.id && session.user?.id === post.seller?.id)) {
        return null;
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        size="icon-sm"
                        onClick={toggleFavorite}
                        className={className}
                        loading={favMutation.isPending}
                        disabled={favMutation.isPending}
                    >
                        <Heart fill={isFavorite ? "currentColor" : "none"} />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    {isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
