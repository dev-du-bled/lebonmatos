import { Metadata } from "next";
import { cache } from "react";
import { trpc } from "@/trpc/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import { Star, FileText } from "lucide-react";
import { PostCard } from "./post-card";

type Params = {
    id: string;
};

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
    const { id } = await params;

    const user = await getUser(id);

    return {
        title: `Profil de ${user?.name.slice(0, 15)}${user?.name.length || 0 > 15 ? "..." : ""}`,
        description: `Découvrez en détails le profil de ${user?.name}`,
    };
}

const getUser = cache(async (id: string) => {
    const user = await trpc.user.getProfile({ userId: id });
    return user;
});

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
                    <div className="flex items-center justify-center gap-2 md:justify-start">
                        <Skeleton className="h-4 w-20" />
                    </div>
                </div>
            </div>
            <Skeleton className="h-10 w-32" />
        </div>
    );
}

function ProfileHeader({ user }: { user: any }) {
    const displayName = user.username ?? user.name ?? "Mon profil";
    const initials = displayName
        .split(/\s+/)
        .map((segment: string) => segment[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase();

    const ratingValue = user.rating.average ?? 0;
    const ratingCount = user.rating.count;

    return (
        <div className="flex flex-col items-center gap-6 text-center md:flex-row md:items-center md:justify-between md:text-left">
            <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
                <Avatar className="size-24 border-4 border-background text-3xl font-semibold shadow-lg">
                    {user.image ? (
                        <AvatarImage src={user.image} alt={`Avatar de ${displayName}`} className="object-cover" />
                    ) : null}
                    <AvatarFallback className="bg-secondary text-muted-foreground">{initials}</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold sm:text-3xl">{displayName}</h1>
                        {user.username && user.username !== displayName && (
                            <p className="text-sm text-muted-foreground">@{user.username}</p>
                        )}
                    </div>

                    {user.bio && <p className="max-w-md text-sm text-muted-foreground">{user.bio}</p>}

                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground md:justify-start">
                        <span className="flex items-center gap-1 font-medium text-foreground">
                            {ratingValue > 0 ? ratingValue.toFixed(1) : "-"}
                            <Star className="size-4 text-primary" fill="currentColor" />
                        </span>
                        <span>({ratingCount} avis)</span>
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

async function ListingsContent({ user }: { user: { id: string } | null }) {
    if (!user?.id) {
        return <EmptyState />;
    }

    const listings = await trpc.posts.getUserListings({ userId: user.id });

    if (!listings || listings.length === 0) {
        return <EmptyState />;
    }

    return (
        <div className="grid gap-4">
            {listings.map((listing) => (
                <PostCard key={listing.id} post={listing} />
            ))}
        </div>
    );
}

export default async function ProfilePage({ params }: { params: Promise<Params> }) {
    const { id } = await params;

    const user = await getUser(id);

    return (
        <section className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
            {
                <Suspense fallback={<ProfileHeaderSkeleton />}>
                    <ProfileHeader user={user} />
                    <ListingsContent user={user} />
                </Suspense>
            }
        </section>
    );
}
