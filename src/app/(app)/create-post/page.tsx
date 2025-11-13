import { getUser } from "@/app/utils/getUser";
import CreatePostForm from "@/components/create-post/create-post-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Créer une Annonce",
};

export default async function CreatePostPage() {
  await getUser();

  return (
    <div className="flex min-h-screen flex-col items-center p-4">
      <div className="w-full max-w-md md:max-w-lg lg:max-w-2xl">
        <CreatePostForm />
      </div>
    </div>
  );
}
