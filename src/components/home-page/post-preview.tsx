"use client";

import { Post, Image as Img, User } from "@prisma/client";
import Image from "next/image";
import UserPreview from "./user-preview";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface PostPreviewProps {
    post: Post & { user: User; images: Img[] };
    fullHeight: boolean;
}

export default function PostPreview({ post, fullHeight }: PostPreviewProps) {
    return (
        <Link
            href={`/post/${post.id}`}
            className={cn(
                "flex flex-col gap-0.5 rounded-md select-none cursor-pointer p-3",
                fullHeight ? "" : "hover:bg-black/5 transition-colors"
            )}
        >
            {/* [INFO] While the api handles missing images, having a frontend-side fallback could be necessary in some cases*/}
            {/* Lyna, next time, explain what you mean by "in some cases", cuz i don't remember :c */}
            <Image
                width={1920}
                height={1080}
                src={post.images.at(0)?.image}
                className={cn(
                    "w-full object-cover rounded-md shadow-2xl",
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
                    {/* [TODO] Add location Data*/}
                    <span className="text-sm font-sans">{`${post.price}€${post.location ? ` ⋅ ${post.location}` : ""}`}</span>
                    <UserPreview user={post.user} />
                </>
            )}
        </Link>
    );
}
