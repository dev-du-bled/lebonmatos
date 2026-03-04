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
            className="flex items-center gap-4 border rounded-lg overflow-hidden my-1.5 hover:bg-muted/50 transition-colors"
        >
            <div className="w-44 h-32 shrink-0 bg-muted">
                <Image
                    src={post.images[0] || "/images/fallback.webp"}
                    alt={post.title}
                    width={176}
                    height={128}
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="flex-1 min-w-0 py-3">
                <p className="font-sans font-semibold text-base">
                    {post.title}
                </p>
                <p className="font-sans font-semibold text-base">
                    {post.price} €
                </p>
                <p className="font-sans text-sm text-muted-foreground mt-2">
                    {getEnumDisplay(post.componentType)}
                </p>
                {post.locationCity && (
                    <p className="font-sans text-sm text-muted-foreground">
                        {post.locationCity}
                    </p>
                )}
            </div>
            <div onClick={(e) => e.preventDefault()}>
                <FavoriteButton
                    post={{ id: post.id, seller: { id: post.userId } }}
                    className="mr-3"
                />
            </div>
        </Link>
    );
});
