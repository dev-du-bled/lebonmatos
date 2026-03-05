import { Suspense } from "react";
import Link from "next/link";
import { MessageSquare, Star } from "lucide-react";
import { trpc } from "@/trpc/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Metadata } from "next";
import NavBack from "@/components/nav/nav-back";
import { ReviewsSkeleton } from "./skeleton";

export const metadata: Metadata = {
    title: "Mes avis",
    description: "Les avis que vous avez laissés",
};

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
                <h2 className="text-xl font-semibold">Aucun avis posté</h2>
                <p className="max-w-sm text-muted-foreground">
                    Vous n&apos;avez pas encore laissé d&apos;avis. Achetez un
                    article pour pouvoir noter un vendeur.
                </p>
            </div>
        </div>
    );
}

async function ReviewsContent() {
    const reviews = await trpc.user.getGivenReviews();

    if (reviews.length === 0) {
        return <EmptyState />;
    }

    return (
        <div className="grid gap-4">
            {reviews.map((review) => {
                const displayName =
                    review.recipient.displayUsername ??
                    review.recipient.username ??
                    "Utilisateur supprimé";
                const initials = displayName
                    .split(/\s+/)
                    .map((s: string) => s[0])
                    .filter(Boolean)
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();
                const date = new Date(review.createdAt).toLocaleDateString(
                    "fr-FR",
                    {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                    }
                );

                return (
                    <Card key={review.id} className="p-5">
                        <CardContent className="p-0">
                            <div className="flex items-start gap-4">
                                <Link
                                    href={
                                        review.recipient.username
                                            ? `/user/${review.recipient.username}`
                                            : "#"
                                    }
                                >
                                    <Avatar className="size-10 shrink-0">
                                        {review.recipient.image ? (
                                            <AvatarImage
                                                src={review.recipient.image}
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
                                            href={
                                                review.recipient.username
                                                    ? `/user/${review.recipient.username}`
                                                    : "#"
                                            }
                                            className="font-semibold hover:underline"
                                        >
                                            {displayName}
                                        </Link>
                                        <span className="text-xs text-muted-foreground">
                                            {date}
                                        </span>
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
    );
}

export default function ReviewsPage() {
    return (
        <section className="mx-auto w-full max-w-4xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
            <NavBack
                href="/profile"
                title="Mes avis"
                desc="Les avis que vous avez laissés aux vendeurs"
            />

            <Suspense fallback={<ReviewsSkeleton />}>
                <ReviewsContent />
            </Suspense>
        </section>
    );
}
