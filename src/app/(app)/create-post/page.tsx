import CreatePostForm from "@/components/create-post/create-post-form";
import RequiredLogin from "@/components/required-login";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Créer une Annonce",
};

export default async function CreatePostPage() {
    return (
        <RequiredLogin>
            <div className="flex flex-col items-center p-4">
                <div className="w-full max-w-md md:max-w-lg lg:max-w-2xl transition-all">
                    <CreatePostForm />
                </div>
            </div>
        </RequiredLogin>
    );
}
