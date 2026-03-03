import { Suspense } from "react";
import Link from "next/link";
import { FileText, Search } from "lucide-react";
import { trpc } from "@/trpc/server";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { FavoriteCard } from "./favorite-card";
import { Metadata } from "next";
import NavBack from "@/components/nav/nav-back";

export const metadata: Metadata = {
    title: "Mes Favoris",
    description: "Gérez vos favoris",
};

function FavoriteCardSkeleton() {
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

function FavoritesSkeleton() {
    return (
        <div className="grid gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
                <FavoriteCardSkeleton key={i} />
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
                <h2 className="text-xl font-semibold">Aucun Favoris</h2>
                <p className="max-w-sm text-muted-foreground">
                    Vous n&apos;avez pas encore mis en favoris d&apos;annonce.
                    Commencez à explorer des annonces et ajoutez vos coups de
                    coeurs à vos favoris.
                </p>
            </div>
            <Link href="/" className={cn(buttonVariants({ size: "lg" }))}>
                <Search className="size-4" />
                Explorer les annonces
            </Link>
        </div>
    );
}

async function FavoriteContent() {
    const favorites = await trpc.posts.getUserFavorites();

    if (favorites.length === 0) {
        return <EmptyState />;
    }

    return (
        <div className="grid gap-4">
            {favorites.map((favorite) => (
                <FavoriteCard key={favorite.id} favorite={favorite} />
            ))}
        </div>
    );
}

export default function FavoritePage() {
    return (
        <section className="mx-auto w-full max-w-4xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
            <NavBack
                href="/profile"
                title="Mes favoris"
                desc="Gérez vos favoris"
            />

            <Suspense fallback={<FavoritesSkeleton />}>
                <FavoriteContent />
            </Suspense>
        </section>
    );
}
