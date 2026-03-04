import CreatePostForm from "@/components/create-post/create-post-form";
import RequiredLogin from "@/components/auth/required-login";
import { Metadata } from "next";
import { trpc } from "@/trpc/server";
import { inferRouterOutputs } from "@trpc/server";
import { AppRouter } from "@/trpc/routers/_app";

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
    const { edit } = await searchParams;

    let post: inferRouterOutputs<AppRouter>["posts"]["getPost"] | null = null;
    if (edit) {
        const basePost = await trpc.posts.getPost({
            postId: edit,
            sellerData: false,
        });

        // hacky fix for "Only plain objects can be passed to Client Components from Server Components. Decimal objects are not supported."
        post = JSON.parse(JSON.stringify(basePost));
    }

    return (
        <RequiredLogin>
            <div className="flex flex-col items-center p-4">
                <div className="w-full max-w-md md:max-w-lg lg:max-w-2xl transition-all">
                    <CreatePostForm post={post} />
                </div>
            </div>
        </RequiredLogin>
    );
}
