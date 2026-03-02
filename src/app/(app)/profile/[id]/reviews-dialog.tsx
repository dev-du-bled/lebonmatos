"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type Review = {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    rater: {
        id: string;
        username: string | null;
        displayUsername: string | null;
        image: string | null;
    };
};

type ReviewsDialogProps = {
    reviews: Review[];
    average: number;
    username: string;
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

export function ReviewsDialog({
    reviews,
    average,
    username,
}: ReviewsDialogProps) {
    const count = reviews.length;

    return (
        <Dialog>
            <DialogTrigger asChild>
                <button
                    className="flex items-center justify-center gap-2 text-sm text-muted-foreground md:justify-start hover:text-foreground transition-colors cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                >
                    <span className="flex items-center gap-1 font-medium text-foreground">
                        {average > 0 ? average.toFixed(1) : "-"}
                        <Star className="size-4 text-primary fill-primary" />
                    </span>
                    <span className="underline underline-offset-2">
                        ({count} avis)
                    </span>
                </button>
            </DialogTrigger>

            <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden">
                <DialogHeader className="px-6 pt-6 pb-4 border-b">
                    <DialogTitle>Avis reçus par {username}</DialogTitle>
                    {count > 0 && (
                        <div className="flex items-center gap-3 mt-2">
                            <span className="text-3xl font-bold">
                                {average.toFixed(1)}
                            </span>
                            <div className="space-y-0.5">
                                <StarRating value={Math.round(average)} />
                                <p className="text-xs text-muted-foreground">
                                    {count} avis au total
                                </p>
                            </div>
                        </div>
                    )}
                </DialogHeader>

                <ScrollArea className="max-h-[60vh]">
                    {count === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center px-6">
                            <Star className="size-10 text-muted-foreground" />
                            <p className="text-muted-foreground text-sm">
                                Aucun avis pour le moment.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {reviews.map((review) => {
                                const displayName =
                                    review.rater.displayUsername ??
                                    review.rater.username ??
                                    "Utilisateur supprimé";
                                const initials = displayName
                                    .split(/\s+/)
                                    .map((s) => s[0])
                                    .filter(Boolean)
                                    .slice(0, 2)
                                    .join("")
                                    .toUpperCase();
                                const date = new Date(
                                    review.createdAt
                                ).toLocaleDateString("fr-FR", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                });

                                return (
                                    <div
                                        key={review.id}
                                        className="flex items-start gap-4 px-6 py-4"
                                    >
                                        <Link
                                            href={`/profile/${review.rater.id}`}
                                            className="shrink-0"
                                        >
                                            <Avatar className="size-10">
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
                                        <div className="flex-1 space-y-1">
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <Link
                                                    href={`/profile/${review.rater.id}`}
                                                    className="font-semibold text-sm hover:underline"
                                                >
                                                    {displayName}
                                                </Link>
                                                <span className="text-xs text-muted-foreground">
                                                    {date}
                                                </span>
                                            </div>
                                            <StarRating value={review.rating} />
                                            {review.comment && (
                                                <p className="text-sm text-muted-foreground pt-0.5">
                                                    {review.comment}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
