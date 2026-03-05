import { Suspense } from "react";
import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { trpc } from "@/trpc/server";
import { getUser } from "@/utils/getUser";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ListingCard } from "@/components/profile/listing-card";
import { Metadata } from "next";
import NavBack from "@/components/nav/nav-back";
import { ListingsSkeleton } from "./skeleton";

export const metadata: Metadata = {
    title: "Mes annonces",
    description: "Gérez vos annonces en ligne sur LeBonMatos",
};

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center gap-6 py-16 text-center">
            <div className="flex size-20 items-center justify-center rounded-full bg-secondary">
                <FileText className="size-10 text-muted-foreground" />
            </div>
            <div className="space-y-2">
                <h2 className="text-xl font-semibold">Aucune annonce</h2>
                <p className="max-w-sm text-muted-foreground">
                    Vous n&apos;avez pas encore publié d&apos;annonce. Commencez
                    à vendre vos composants dès maintenant !
                </p>
            </div>
            <Link
                href="/create-post"
                className={cn(buttonVariants({ size: "lg" }))}
            >
                <Plus className="size-4" />
                Publier une annonce
            </Link>
        </div>
    );
}

async function ListingsContent() {
    const user = await getUser();
    const listings = await trpc.posts.getUserListings({ userId: user.id });

    if (listings.length === 0) {
        return <EmptyState />;
    }

    return (
        <div className="grid gap-4">
            {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} showActions />
            ))}
        </div>
    );
}

async function HeaderAction() {
    const user = await getUser();
    const listings = await trpc.posts.getUserListings({ userId: user.id });

    if (listings.length === 0) {
        return null;
    }

    return (
        <Link href="/create-post" className={cn(buttonVariants())}>
            <Plus className="size-4" />
            Nouvelle annonce
        </Link>
    );
}

export default function ListingsPage() {
    return (
        <section className="mx-auto w-full max-w-4xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
            <NavBack
                href="/profile"
                title="Mes annonces"
                desc="Gérez vos annonces en ligne"
            >
                <Suspense fallback={<Skeleton className="h-9 w-40" />}>
                    <HeaderAction />
                </Suspense>
            </NavBack>

            <Suspense fallback={<ListingsSkeleton />}>
                <ListingsContent />
            </Suspense>
        </section>
    );
}
