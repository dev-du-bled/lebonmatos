import { TRPCError } from "@trpc/server";
import { notFound, redirect } from "next/navigation";
import ProfileEditForm from "@/components/profile/profile-edit-form";
import { HydrateClient, trpc } from "@/trpc/server";

export default async function ProfileEditPage() {
    let profile;
    try {
        profile = await trpc.user.getProfile();
    } catch (error) {
        if (error instanceof TRPCError) {
            if (error.code === "UNAUTHORIZED") {
                return redirect("/login?next=/profile/edit");
            }
            if (error.code === "NOT_FOUND") {
                return notFound();
            }
        }
        throw error;
    }

    return (
        <HydrateClient>
            <ProfileEditForm initialData={profile} />
        </HydrateClient>
    );
}
