import { Suspense } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NavCard } from "@/components/nav/nav-card";
import type { LucideIcon } from "lucide-react";
import {
    AlertTriangle,
    Cpu,
    FileText,
    Heart,
    MessageSquare,
    Settings,
    ShoppingBag,
} from "lucide-react";
import { trpc } from "@/trpc/server";
import { PublicProfileDialog } from "@/components/profile/public-profile-dialog";
import { ReviewsDialog } from "@/app/(app)/profile/[id]/reviews-dialog";
import { Metadata } from "next";
import { ProfileHeaderSkeleton } from "./skeleton";

type QuickAction = {
    title: string;
    description: string;
    href: string;
    Icon: LucideIcon;
};

const QUICK_ACTIONS: QuickAction[] = [
    {
        title: "Paramètres du compte",
        description: "Gérer mes informations privées, ma confidentialité, etc.",
        href: "/profile/edit",
        Icon: Settings,
    },
    {
        title: "Mes annonces",
        description: "Voir mes annonces en ligne et expirées",
        href: "/profile/listings",
        Icon: FileText,
    },
    {
        title: "Mes achats",
        description: "Voir mes achats effectués",
        href: "/profile/purchases",
        Icon: ShoppingBag,
    },
    {
        title: "Mes configurations",
        description: "Voir mes configurations enregistrées",
        href: "/profile/configurations",
        Icon: Cpu,
    },
    {
        title: "Mes signalements",
        description: "Suivre l'état de mes signalements",
        href: "/profile/reports",
        Icon: AlertTriangle,
    },
    {
        title: "Favoris",
        description: "Voir mes annonces favorites",
        href: "/profile/favorites",
        Icon: Heart,
    },
    {
        title: "Avis",
        description: "Voir les avis que j'ai posté",
        href: "/profile/reviews",
        Icon: MessageSquare,
    },
];

export const metadata: Metadata = {
    title: "Mon profil",
    description: "Gérer les paramètres de votre compte",
};

async function ProfileHeader() {
    const user = await trpc.user.getProfile();
    const [stats, firstPage] = await Promise.all([
        trpc.user.getReviewStats({ userId: user.id }),
        trpc.user.getReceivedReviews({ userId: user.id, limit: 10 }),
    ]);

    const displayName = user.username ?? "Mon profil";
    const initials = displayName
        .split(/\s+/)
        .map((segment: string) => segment[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase();

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

                    <ReviewsDialog
                        userId={user.id}
                        initialReviews={firstPage.reviews}
                        initialNextCursor={firstPage.nextCursor}
                        average={stats.average}
                        count={stats.count}
                        username={displayName}
                    />
                </div>
            </div>

            <PublicProfileDialog user={user} />
        </div>
    );
}

export default function ProfilePage() {
    return (
        <section className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
            <Suspense fallback={<ProfileHeaderSkeleton />}>
                <ProfileHeader />
            </Suspense>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {QUICK_ACTIONS.map((action) => (
                    <NavCard key={action.href} {...action} />
                ))}
            </div>
        </section>
    );
}
