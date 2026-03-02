import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, MessageSquare, Star } from "lucide-react";
import { trpc } from "@/trpc/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Mes avis",
    description: "Les avis laissés par les autres utilisateurs",
};

function ReviewCardSkeleton() {
    return (
        <Card className="p-5">
            <div className="flex items-start gap-4">
                <Skeleton className="size-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
            </div>
        </Card>
    );
}

function ReviewsSkeleton() {
    return (
        <div className="grid gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
                <ReviewCardSkeleton key={i} />
            ))}
        </div>
    );
}

function StarRating({ value }: { value: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
                <Star
                    key={i}
                    className={cn(
                        "size-4",
                        i < value
                            ? "fill-primary text-primary"
                            : "fill-muted text-muted"
                    )}
                />
            ))}
        </div>
    );
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center gap-6 py-16 text-center">
            <div className="flex size-20 items-center justify-center rounded-full bg-secondary">
                <MessageSquare className="size-10 text-muted-foreground" />
            </div>
            <div className="space-y-2">
                <h2 className="text-xl font-semibold">Aucun avis</h2>
                <p className="max-w-sm text-muted-foreground">
                    Vous n&apos;avez pas encore reçu d&apos;avis. Les avis apparaîtront ici après vos transactions.
                </p>
            </div>
        </div>
    );
}

async function ReviewsContent() {
    const reviews = await trpc.user.getMyReviews();

    if (reviews.length === 0) {
        return <EmptyState />;
    }

    const average = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 rounded-xl border bg-secondary/40 px-5 py-4">
                <span className="text-4xl font-bold">{average.toFixed(1)}</span>
                <div className="space-y-1">
                    <StarRating value={Math.round(average)} />
                    <p className="text-sm text-muted-foreground">
                        {reviews.length} avis au total
                    </p>
                </div>
            </div>

            <div className="grid gap-4">
                {reviews.map((review) => {
                    const displayName =
                        review.rater.displayUsername ??
                        review.rater.username ??
                        "Utilisateur supprimé";
                    const initials = displayName
                        .split(/\s+/)
                        .map((s: string) => s[0])
                        .filter(Boolean)
                        .slice(0, 2)
                        .join("")
                        .toUpperCase();
                    const date = new Date(review.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                    });

                    return (
                        <Card key={review.id} className="p-5">
                            <CardContent className="p-0">
                                <div className="flex items-start gap-4">
                                    <Link href={`/profile/${review.rater.id}`}>
                                        <Avatar className="size-10 shrink-0">
                                            {review.rater.image ? (
                                                <AvatarImage
                                                    src={review.rater.image}
                                                    alt={`Avatar de ${displayName}`}
                                                    className="object-cover"
                                                />
                                            ) : null}
                                            <AvatarFallback className="bg-secondary text-muted-foreground text-sm">
                                                {initials}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Link>
                                    <div className="flex-1 space-y-1.5">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <Link
                                                href={`/profile/${review.rater.id}`}
                                                className="font-semibold hover:underline"
                                            >
                                                {displayName}
                                            </Link>
                                            <span className="text-xs text-muted-foreground">{date}</span>
                                        </div>
                                        <StarRating value={review.rating} />
                                        {review.comment && (
                                            <p className="pt-1 text-sm text-muted-foreground">
                                                {review.comment}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}

export default function ReviewsPage() {
    return (
        <section className="mx-auto w-full max-w-4xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-center gap-4">
                <Link
                    href="/profile"
                    className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
                >
                    <ArrowLeft className="size-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-semibold">Mes avis</h1>
                    <p className="text-sm text-muted-foreground">
                        Les avis laissés par les autres utilisateurs
                    </p>
                </div>
            </div>

            <Suspense fallback={<ReviewsSkeleton />}>
                <ReviewsContent />
            </Suspense>
        </section>
    );
}