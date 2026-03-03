import { Suspense } from "react";
import Link from "next/link";
import { FileText, Plus, ArrowLeft } from "lucide-react";
import { trpc } from "@/trpc/server";
import { getUser } from "@/utils/getUser";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ListingCard } from "./listing-card";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Mes annonces",
    description: "Gérez vos annonces en ligne sur LeBonMatos",
};

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
                <ListingCard key={listing.id} listing={listing} />
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
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/profile"
                        className={cn(
                            buttonVariants({
                                variant: "ghost",
                                size: "icon",
                            })
                        )}
                    >
                        <ArrowLeft className="size-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-semibold">Mes annonces</h1>
                        <p className="text-sm text-muted-foreground">
                            Gérez vos annonces en ligne
                        </p>
                    </div>
                </div>
                <Suspense fallback={<Skeleton className="h-9 w-40" />}>
                    <HeaderAction />
                </Suspense>
            </div>

            <Suspense fallback={<ListingsSkeleton />}>
                <ListingsContent />
            </Suspense>
        </section>
    );
}
