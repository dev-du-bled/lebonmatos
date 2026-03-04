import { memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { getEnumDisplay } from "@/utils/components";
import FavoriteButton from "@/app/(app)/post/[id]/favorite-button";
import { type ComponentType } from "@prisma/client";

export type SearchHit = {
    id: string;
    title: string;
    price: number;
    componentType: ComponentType;
    componentName: string;
    locationCity: string | null;
    images: string[];
    userId: string;
};

export const SearchResultItem = memo(function SearchResultItem({
    post,
}: {
    post: SearchHit;
}) {
    return (
        <Link
            href={`/post/${post.id}`}
            className="flex items-stretch gap-4 border rounded-lg overflow-hidden my-1.5 hover:bg-muted/50 transition-colors"
        >
            <div className="relative w-28 min-h-24 sm:w-44 sm:min-h-32 shrink-0 bg-muted">
                <Image
                    src={post.images[0] || "/images/fallback.webp"}
                    alt={post.title}
                    fill
                    className="object-cover"
                />
                <div
                    className="absolute top-1.5 right-1.5 sm:hidden"
                    onClick={(e) => e.preventDefault()}
                >
                    <FavoriteButton
                        post={{ id: post.id, seller: { id: post.userId } }}
                        className="size-7 bg-background/80 hover:bg-background"
                    />
                </div>
            </div>

            <div className="flex-1 min-w-0 py-3 flex flex-col justify-center">
                <p className="font-sans font-semibold text-base truncate">
                    {post.title}
                </p>
                <p className="font-sans font-semibold text-base sm:hidden">
                    {post.price} €
                </p>
                <p className="font-sans text-sm text-muted-foreground mt-1">
                    {getEnumDisplay(post.componentType)}
                </p>
                {post.locationCity && (
                    <p className="font-sans text-sm text-muted-foreground">
                        {post.locationCity}
                    </p>
                )}
            </div>

            <div className="hidden sm:flex flex-col items-end justify-center gap-2 mr-4 shrink-0">
                <p className="font-sans font-semibold text-base">
                    {post.price} €
                </p>
                <div onClick={(e) => e.preventDefault()}>
                    <FavoriteButton
                        post={{ id: post.id, seller: { id: post.userId } }}
                    />
                </div>
            </div>
        </Link>
    );
});
