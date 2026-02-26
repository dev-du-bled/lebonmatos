import Image from "next/image";
import UserPreview from "./user-preview";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { trpc } from "@/trpc/server";

interface PostPreviewProps {
    post: Awaited<ReturnType<typeof trpc.posts.getHomePage>>["posts"][number];
    fullHeight: boolean;
}

export default async function PostPreview({
    post,
    fullHeight,
}: PostPreviewProps) {
    return (
        <Link
            href={`/post/${post.id}`}
            className={cn(
                "flex flex-col flex-1 rounded-lg overflow-hidden select-none cursor-pointer border border-border bg-card transition-all duration-200",
                fullHeight ? "" : "hover:bg-gray-100"
            )}
        >
            <Image
                width={960}
                height={540}
                src={post.images.at(0) || "/images/fallback.webp"}
                className={cn(
                    "w-full object-cover overflow-hidden",
                    fullHeight
                        ? "aspect-3/4 hover:scale-105 transition-transform"
                        : "aspect-16/10"
                )}
                alt=""
            />
            {!fullHeight && (
                <div className="flex flex-col gap-1 p-2.5 flex-1">
                    <span className="text-sm font-semibold font-sans leading-tight line-clamp-1">
                        {post.title}
                    </span>
                    <span className="text-sm font-sans text-muted-foreground line-clamp-1">
                        {`${post.price}€${post.location ? ` ⋅ ${post.location.city}` : ""}`}
                    </span>
                    <div className="mt-auto pt-2">
                        <UserPreview user={post.user} />
                    </div>
                </div>
            )}
        </Link>
    );
}
