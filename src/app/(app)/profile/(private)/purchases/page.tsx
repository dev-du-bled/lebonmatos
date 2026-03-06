import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Search } from "lucide-react";
import { trpc } from "@/trpc/server";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Metadata } from "next";
import NavBack from "@/components/nav/nav-back";
import { PurchasesSkeleton } from "./skeleton";

export const metadata: Metadata = {
    title: "Mes achats",
    description: "Retrouvez vos achats effectués sur LeBonMatos",
};

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center gap-6 py-16 text-center">
            <div className="flex size-20 items-center justify-center rounded-full bg-secondary">
                <ShoppingBag className="size-10 text-muted-foreground" />
            </div>
            <div className="space-y-2">
                <h2 className="text-xl font-semibold">Aucun achat</h2>
                <p className="max-w-sm text-muted-foreground">
                    Vous n&apos;avez pas encore effectué d&apos;achat. Explorez
                    les annonces pour trouver votre bonheur !
                </p>
            </div>
            <Link href="/" className={cn(buttonVariants({ size: "lg" }))}>
                <Search className="size-4" />
                Explorer les annonces
            </Link>
        </div>
    );
}

function formatDate(isoDate: string | null) {
    if (!isoDate) return null;
    return new Date(isoDate).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

async function PurchasesContent() {
    const purchases = await trpc.posts.getUserPurchases();

    if (purchases.length === 0) {
        return <EmptyState />;
    }

    return (
        <div className="grid gap-4">
            {purchases.map((purchase) => {
                const date = formatDate(purchase.soldAt);

                return (
                    <Card
                        key={purchase.id}
                        className="overflow-hidden transition hover:border-primary hover:shadow-md p-0 gap-0"
                    >
                        <div className="flex flex-col sm:flex-row">
                            <Link
                                href={`/post/${purchase.id}`}
                                className="relative h-40 w-full bg-secondary sm:h-auto sm:w-48 shrink-0"
                            >
                                <Image
                                    src={
                                        purchase.thumbnail?.image ||
                                        "/images/fallback.webp"
                                    }
                                    alt={
                                        purchase.thumbnail?.alt ??
                                        purchase.title
                                    }
                                    fill
                                    className="h-full w-full object-cover"
                                />
                            </Link>
                            <div className="flex flex-1 flex-col justify-between p-4 gap-4">
                                <Link
                                    href={`/post/${purchase.id}`}
                                    className="space-y-1"
                                >
                                    <div className="flex justify-between items-start gap-2">
                                        <CardTitle className="text-base line-clamp-1">
                                            {purchase.title}
                                        </CardTitle>
                                        <span className="text-lg font-semibold shrink-0 dark:text-primary">
                                            {purchase.price.toLocaleString(
                                                "fr-FR"
                                            )}{" "}
                                            €
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {purchase.component.name}
                                    </p>
                                    {purchase.description && (
                                        <CardDescription className="line-clamp-2 text-sm">
                                            {purchase.description}
                                        </CardDescription>
                                    )}
                                </Link>
                                <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
                                    <span>
                                        Vendu par{" "}
                                        <Link
                                            href={`/profile/${purchase.seller.id}`}
                                            className="font-medium hover:underline"
                                        >
                                            {purchase.seller.username ??
                                                "Utilisateur supprimé"}
                                        </Link>
                                    </span>
                                    {date ? (
                                        <Badge
                                            variant="secondary"
                                            className="text-xs"
                                        >
                                            {date}
                                        </Badge>
                                    ) : (
                                        <Badge
                                            variant="outline"
                                            className="text-xs"
                                        >
                                            Date inconnue
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}

export default function PurchasesPage() {
    return (
        <section className="mx-auto w-full max-w-4xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
            <NavBack
                href="/profile"
                title="Mes achats"
                desc="Retrouvez vos achats effectués"
            />

            <Suspense fallback={<PurchasesSkeleton />}>
                <PurchasesContent />
            </Suspense>
        </section>
    );
}
