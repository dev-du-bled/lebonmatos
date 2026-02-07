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
                "flex flex-col gap-0.5 rounded-md select-none cursor-pointer p-3",
                fullHeight ? "" : "hover:bg-black/5 transition-colors"
            )}
        >
            <Image
                width={960}
                height={540}
                src={post.images.at(0) || "/images/fallback.webp"}
                className={cn(
                    "w-full object-cover rounded-sm shadow-2xl",
                    fullHeight
                        ? "aspect-3/4 hover:scale-105 transition-transform"
                        : "aspect-16/10"
                )}
                alt=""
            />
            {!fullHeight && (
                <>
                    <span className="text-md font-medium font-sans">
                        {post.title}
                    </span>
                    <span className="text-sm font-sans">{`${post.price}€${post.location ? ` ⋅ ${post.location.city} - ${post.location.country}` : ""}`}</span>
                    <UserPreview user={post.user} />
                </>
            )}
        </Link>
    );
}
