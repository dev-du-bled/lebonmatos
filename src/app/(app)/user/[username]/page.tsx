import { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";

import { trpc } from "@/trpc/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Suspense } from "react";
import { FileText, Medal } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReviewsDialog } from "./reviews-dialog";
import { ListingsGrid } from "./listings-grid";
import ReportButton from "@/components/report/report-button";
import { PublicProfileHeaderSkeleton, ListingsSkeleton } from "./skeleton";

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

type MemberTier = {
    color: string;
    bg: string;
    label: string;
};

function getMemberSince(createdAt: Date): { label: string; tier: MemberTier } {
    const now = new Date();
    const diffMs = now.getTime() - createdAt.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    const label =
        diffYears >= 1
            ? `${diffYears} an${diffYears > 1 ? "s" : ""}`
            : diffMonths >= 1
              ? `${diffMonths} mois`
              : `${diffDays} jour${diffDays > 1 ? "s" : ""}`;

    // Bronze < 6 months — Silver 6m–2y — Gold 2y–5y — Diamond 5y+
    const tier: MemberTier =
        diffYears >= 5
            ? {
                  color: "text-sky-400",
                  bg: "bg-sky-400/10 border-sky-400/30",
                  label: "Diamant",
              }
            : diffYears >= 2
              ? {
                    color: "text-yellow-400",
                    bg: "bg-yellow-400/10 border-yellow-400/30",
                    label: "Or",
                }
              : diffMonths >= 6
                ? {
                      color: "text-slate-400",
                      bg: "bg-slate-400/10 border-slate-400/30",
                      label: "Argent",
                  }
                : {
                      color: "text-amber-700",
                      bg: "bg-amber-700/10 border-amber-700/30",
                      label: "Bronze",
                  };

    return { label, tier };
}

async function ProfileHeader({ usernameParam }: { usernameParam: string }) {
    const user = await getUser(usernameParam);
    if (!user) return null;

    const displayName = user.username ?? "Utilisateur";
    const initials = displayName
        .split(/\s+/)
        .map((segment: string) => segment[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase();

    const [stats, firstPage] = await Promise.all([
        trpc.user.getReviewStats({ userId: user.id }),
        trpc.user.getReceivedReviews({ userId: user.id, limit: 10 }),
    ]);

    const { label: memberLabel, tier } = getMemberSince(
        new Date(user.createdAt)
    );

    return (
        <div className="flex flex-col items-center gap-6 text-center md:flex-row md:items-center md:justify-between md:text-left">
            <div className="flex flex-col items-center gap-6 md:flex-row md:items-start ">
                <Avatar className="size-24 border-4 border-background text-3xl font-semibold shadow-lg">
                    {user.image ? (
                        <AvatarImage
                            src={user.image}
                            alt={`Avatar de ${displayName}`}
                            className="object-cover"
                        />
                    ) : null}
                    <AvatarFallback className="bg-secondary text-muted-foreground">
                        {initials}
                    </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold sm:text-3xl">
                            {displayName}
                        </h1>
                    </div>
                    {user.bio && (
                        <p className="max-w-md text-sm text-muted-foreground">
                            {user.bio}
                        </p>
                    )}
                    <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
                        <ReviewsDialog
                            userId={user.id}
                            initialReviews={firstPage.reviews}
                            initialNextCursor={firstPage.nextCursor}
                            average={stats.average}
                            count={stats.count}
                            username={displayName}
                        />
                        <span className="text-muted-foreground/40 hidden sm:inline select-none">
                            ·
                        </span>
                        <span
                            title={`Membre ${tier.label} — inscrit depuis ${memberLabel}`}
                            className={cn(
                                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
                                tier.bg
                            )}
                        >
                            <Medal className={cn("size-3.5", tier.color)} />
                            <span className={tier.color}>
                                Membre depuis {memberLabel}
                            </span>
                        </span>
                    </div>
                </div>
            </div>
            <ReportButton
                type="USER"
                width="full"
                reportedId={user.id}
                userId={user.id}
                tooltipText={`Signaler l'utilisateur ${displayName}`}
            />
        </div>
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
                    <ProfileHeader usernameParam={username} />
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
