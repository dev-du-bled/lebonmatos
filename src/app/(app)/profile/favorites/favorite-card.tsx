"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { trpc } from "@/trpc/client";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ComponentType } from "@prisma/client";

interface FavoriteCardProps {
    favorite: {
        id: string;
        title: string;
        description: string | null;
        price: number;
        component: {
            id: string;
            name: string;
            type: ComponentType;
        };
        thumbnail: {
            image: string;
            alt: string | null;
        } | null;
    };
}

export function FavoriteCard({ favorite }: FavoriteCardProps) {
    const router = useRouter();
    const favoritePost = trpc.posts.favoritePost.useMutation({
        onSuccess: () => router.refresh(),
    });

    const handleRemoveFavorite = () => {
        favoritePost.mutate({ postId: favorite.id });
    };

    return (
        <Card className="overflow-hidden transition hover:border-primary hover:shadow-md p-0 gap-0 relative">
            <div className="flex flex-col sm:flex-row">
                <Link
                    href={`/post/${favorite.id}`}
                    className="relative h-40 w-full bg-secondary sm:h-auto sm:w-48 shrink-0"
                >
                    <Image
                        src={
                            favorite.thumbnail?.image || "/images/fallback.webp"
                        }
                        alt={favorite.thumbnail?.alt ?? favorite.title}
                        fill
                        className="h-full w-full object-cover"
                    />
                </Link>
                <div className="flex flex-1 flex-col justify-between p-4 gap-4">
                    <Link href={`/post/${favorite.id}`} className="space-y-1">
                        <div className="flex justify-between items-start gap-2">
                            <CardTitle className="text-base line-clamp-1">
                                {favorite.title}
                            </CardTitle>
                            <Button
                                size="icon"
                                aria-label="Retirer des favoris"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleRemoveFavorite();
                                }}
                                disabled={favoritePost.isPending}
                            >
                                <Heart fill="black" />
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {favorite.component.name}
                        </p>
                        {favorite.description && (
                            <CardDescription className="line-clamp-2 text-sm">
                                {favorite.description}
                            </CardDescription>
                        )}
                    </Link>
                    <div className="flex items-center justify-end gap-2">
                        <span className="text-lg font-semibold dark:text-primary">
                            {favorite.price} €
                        </span>
                    </div>
                </div>
            </div>
        </Card>
    );
}
