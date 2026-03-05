import { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";

import { trpc } from "@/trpc/server";
import { Suspense } from "react";
import { FileText } from "lucide-react";
import { ListingsGrid } from "./listings-grid";
import ReportButton from "@/components/report/report-button";
import { PublicProfileHeaderSkeleton, ListingsSkeleton } from "./skeleton";
import { ProfileHeader } from "@/components/profile/profile-header";

type Params = {
    username: string;
};

export async function generateMetadata({
    params,
}: {
    params: Promise<Params>;
}): Promise<Metadata> {
    const { username } = await params;
    const user = await getUser(username);
    if (!user) {
        return {
            title: "Utilisateur non trouvé",
            description: "L'utilisateur que vous recherchez n'existe pas.",
        };
    }

    return {
        title: `Profil de ${user?.username?.slice(0, 15) ?? "Utilisateur"}${(user?.username?.length ?? 0) > 15 ? "..." : ""}`,
        description: `Découvrez en détails le profil de ${user?.username ?? "cet utilisateur"}`,
    };
}

const getUser = cache(async (username: string) => {
    try {
        return await trpc.user.getPublicProfileByUsername({ username });
    } catch {
        return null;
    }
});

async function PublicProfileHeader({ username }: { username: string }) {
    const user = await getUser(username);
    if (!user) return null;

    const [stats, firstPage] = await Promise.all([
        trpc.user.getReviewStats({ userId: user.id }),
        trpc.user.getReceivedReviews({ userId: user.id, limit: 10 }),
    ]);

    const displayName = user.displayUsername ?? user.username ?? "Utilisateur";

    return (
        <ProfileHeader
            user={user}
            reviewStats={stats}
            initialReviews={firstPage.reviews}
            initialNextCursor={firstPage.nextCursor}
            action={
                <ReportButton
                    type="USER"
                    width="full"
                    reportedId={user.id}
                    userId={user.id}
                    tooltipText={`Signaler l'utilisateur ${displayName}`}
                />
            }
        />
    );
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center gap-6 py-16 text-center">
            <div className="flex size-20 items-center justify-center rounded-full bg-secondary">
                <FileText className="size-10 text-muted-foreground" />
            </div>
            <div className="space-y-2">
                <h2 className="text-xl font-semibold">Aucune annonce</h2>
            </div>
        </div>
    );
}

async function ListingsContent({ userId }: { userId: string }) {
    const listings = await trpc.posts.getUserListings({ userId });

    if (!listings || listings.length === 0) {
        return <EmptyState />;
    }

    return <ListingsGrid listings={listings} />;
}

export default async function UserProfilePage({
    params,
}: {
    params: Promise<Params>;
}) {
    const { username } = await params;

    const user = await getUser(username);

    if (!user) notFound();

    return (
        <section className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
            <div className="mb-8">
                <Suspense fallback={<PublicProfileHeaderSkeleton />}>
                    <PublicProfileHeader username={username} />
                </Suspense>
            </div>

            <div className="mb-4 mt-10">
                <h2 className="text-xl font-semibold">Annonces</h2>
                <p className="text-sm text-muted-foreground">
                    Les annonces publiées par ce vendeur
                </p>
            </div>

            <Suspense fallback={<ListingsSkeleton />}>
                {user?.id ? (
                    <ListingsContent userId={user.id} />
                ) : (
                    <EmptyState />
                )}
            </Suspense>
        </section>
    );
}
