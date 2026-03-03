import { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";

import { trpc } from "@/trpc/server";
import { TRPCClientError } from "@trpc/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import { FileText, Medal } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReviewsDialog } from "./reviews-dialog";
import { ListingsGrid } from "./listings-grid";

type Params = {
    id: string;
};

export async function generateMetadata({
    params,
}: {
    params: Promise<Params>;
}): Promise<Metadata> {
    const { id } = await params;
    const user = await getUser(id);
    return {
        title: `Profil de ${user?.username?.slice(0, 15) ?? "Utilisateur"}${(user?.username?.length ?? 0) > 15 ? "..." : ""}`,
        description: `Découvrez en détails le profil de ${user?.username ?? "cet utilisateur"}`,
    };
}

const getUser = cache(async (id: string) => {
    try {
        return await trpc.user.getPublicProfile({ userId: id });
    } catch (error) {
        if (
            error instanceof TRPCClientError &&
            error.data?.code === "NOT_FOUND"
        ) {
            notFound();
        }
        throw error;
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

function ProfileHeaderSkeleton() {
    return (
        <div className="flex flex-col items-center gap-6 text-center md:flex-row md:items-center md:justify-between md:text-left">
            <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
                <Skeleton className="size-24 rounded-full" />
                <div className="space-y-2">
                    <div className="space-y-1">
                        <Skeleton className="h-8 w-40" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-4 w-64" />
                    <Skeleton className="h-4 w-20" />
                </div>
            </div>
        </div>
    );
}

function ListingCardSkeleton() {
    return (
        <Card className="overflow-hidden p-0 gap-0">
            <div className="flex flex-col sm:flex-row">
                <Skeleton className="h-40 w-full sm:h-auto sm:w-48 shrink-0 rounded-none aspect-square sm:aspect-auto" />
                <CardContent className="flex flex-1 flex-col justify-between gap-4 p-4">
                    <div className="space-y-2">
                        <div className="flex justify-between items-start gap-2">
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-6 w-20 shrink-0" />
                        </div>
                        <Skeleton className="h-3 w-1/3" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>
                    <div className="flex items-center justify-end gap-2">
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-8 w-24" />
                    </div>
                </CardContent>
            </div>
        </Card>
    );
}

function ListingsSkeleton() {
    return (
        <div className="grid gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
                <ListingCardSkeleton key={i} />
            ))}
        </div>
    );
}

async function ProfileHeader({ userId }: { userId: string }) {
    const user = await getUser(userId);
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
            <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
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
                        {user.username && user.username !== displayName && (
                            <p className="text-sm text-muted-foreground">
                                @{user.username}
                            </p>
                        )}
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

export default async function ProfilePage({
    params,
}: {
    params: Promise<Params>;
}) {
    const { id } = await params;
    const user = await getUser(id);

    return (
        <section className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
            <div className="mb-8">
                <Suspense fallback={<ProfileHeaderSkeleton />}>
                    <ProfileHeader userId={id} />
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
