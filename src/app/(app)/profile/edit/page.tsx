import { Suspense } from "react";
import { TRPCError } from "@trpc/server";
import { notFound, redirect } from "next/navigation";
import ProfileEditForm from "@/components/profile/profile-edit-form";
import { trpc } from "@/trpc/server";
import { Metadata } from "next";
import NavBack from "@/components/nav/nav-back";
import { ProfileEditFormSkeleton } from "./skeleton";

export const metadata: Metadata = {
    title: "Modifier mon profil",
    description: "Modifiez les informations de votre profil",
};

async function ProfileEditContent() {
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

    return <ProfileEditForm initialData={profile} />;
}

export default function ProfileEditPage() {
    return (
        <div className="mx-auto w-full max-w-4xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
            <NavBack
                href="/profile"
                title="Information Personnelles"
                desc="Gérez vos informations privées et vos coordonnées de
                        contact."
            />
            <Suspense fallback={<ProfileEditFormSkeleton />}>
                <ProfileEditContent />
            </Suspense>
        </div>
    );
}
