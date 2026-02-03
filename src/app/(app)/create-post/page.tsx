import { getUser } from "@/utils/getUser";
import CreatePostForm from "@/components/create-post/create-post-form";
import { Metadata } from "next";
import { Component, Post } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { trpc } from "@/trpc/client";

interface PageProps {
    searchParams: Promise<{ edit?: string }>;
}

export async function generateMetadata({
    searchParams,
}: PageProps): Promise<Metadata> {
    const { edit } = await searchParams;

    const title = edit ? "Editer une Annonce" : "Créer une Annonce";

    return {
        title,
    };
}

export default async function CreatePostPage({ searchParams }: PageProps) {
    await getUser();

    const { edit } = await searchParams;

    let post: (Post & { component: Component }) | null = null;
    if (edit) {
        post = await prisma.post.findUnique({
            where: {
                id: edit,
            },
            include: {
                component: true,
            },
        });
    }

    return (
        <div className="flex flex-col items-center p-4">
            <div className="w-full max-w-md md:max-w-lg lg:max-w-2xl transition-all">
                <CreatePostForm post={post} />
            </div>
        </div>
    );
}
