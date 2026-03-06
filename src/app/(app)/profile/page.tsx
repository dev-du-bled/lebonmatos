import { Suspense } from "react";
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
import { ProfileHeader } from "@/components/profile/profile-header";
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

async function PrivateProfileHeader() {
    const user = await trpc.user.getProfile();
    const [stats, firstPage] = await Promise.all([
        trpc.user.getReviewStats({ userId: user.id }),
        trpc.user.getReceivedReviews({ userId: user.id, limit: 10 }),
    ]);

    return (
        <ProfileHeader
            user={user}
            reviewStats={stats}
            initialReviews={firstPage.reviews}
            initialNextCursor={firstPage.nextCursor}
            action={<PublicProfileDialog user={user} />}
        />
    );
}

export default function ProfilePage() {
    return (
        <section className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
            <Suspense fallback={<ProfileHeaderSkeleton />}>
                <PrivateProfileHeader />
            </Suspense>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {QUICK_ACTIONS.map((action) => (
                    <NavCard key={action.href} {...action} />
                ))}
            </div>
        </section>
    );
}
