import { getUser } from "@/app/utils/getUser";
import CreatePostForm from "@/components/create-post/create-post-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Créer une Annonce",
};

export default async function CreatePostPage() {
  await getUser();

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center p-10">
      <div className="w-full max-w-sm md:max-w-lg lg:max-w-xl xl:max-w-2xl">
        <CreatePostForm />
      </div>
    </div>
  );
}
