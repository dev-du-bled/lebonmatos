"use client";

import Link from "next/link";
import { Star, X, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { trpc } from "@/trpc/client";
import ReportButton from "@/components/report/report-button";

export type Review = {
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
    userId: string;
    initialReviews: Review[];
    initialNextCursor: string | undefined;
    average: number;
    count: number;
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

function ReviewsTrigger({
    average,
    count,
}: {
    average: number;
    count: number;
}) {
    return (
        <span className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground md:justify-start">
            <span className="flex items-center gap-1 font-semibold text-foreground">
                {average > 0 ? average.toFixed(1) : "-"}
                <Star className="size-4 text-primary fill-primary" />
            </span>
            <span className="underline underline-offset-2 cursor-pointer hover:text-foreground transition-colors">
                ({count} avis)
            </span>
        </span>
    );
}

function ReviewsSummary({
    average,
    count,
}: {
    average: number;
    count: number;
}) {
    if (count === 0) return null;
    return (
        <div className="flex items-center gap-3 mt-2">
            <span className="text-3xl font-bold">{average.toFixed(1)}</span>
            <div className="space-y-0.5">
                <StarRating value={Math.round(average)} />
                <p className="text-xs text-muted-foreground">
                    {count} avis au total
                </p>
            </div>
        </div>
    );
}

function ReviewCard({ review }: { review: Review }) {
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
    const date = new Date(review.createdAt).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    const profileHref = review.rater.username
        ? `/user/${review.rater.username}`
        : null;

    return (
        <div className="flex items-start gap-4 px-6 py-4">
            {profileHref ? (
                <Link href={profileHref} className="shrink-0">
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
            ) : (
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
            )}
            <div className="flex-1 min-w-0 space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    {profileHref ? (
                        <Link
                            href={profileHref}
                            className="font-semibold text-sm hover:underline truncate"
                        >
                            {displayName}
                        </Link>
                    ) : (
                        <span className="font-semibold text-sm truncate">
                            {displayName}
                        </span>
                    )}
                    <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-muted-foreground">
                            {date}
                        </span>
                        <ReportButton
                            type="REVIEW"
                            width="icon"
                            reportedId={review.id}
                            userId={review.rater.id}
                            tooltipText="Signaler cet avis"
                        />
                    </div>
                </div>
                <StarRating value={review.rating} />
                {review.comment && (
                    <p className="text-sm text-muted-foreground pt-0.5 wrap-break-word">
                        {review.comment}
                    </p>
                )}
            </div>
        </div>
    );
}

function ReviewsList({
    userId,
    initialReviews,
    initialNextCursor,
}: {
    userId: string;
    initialReviews: Review[];
    initialNextCursor: string | undefined;
}) {
    const [reviews, setReviews] = useState<Review[]>(initialReviews);
    const [cursor, setCursor] = useState<string | undefined>(initialNextCursor);

    const query = trpc.user.getReceivedReviews.useQuery(
        { userId, cursor, limit: 10 },
        {
            enabled: false,
        }
    );

    async function loadMore() {
        const result = await query.refetch();
        if (result.data) {
            setReviews((prev) => [...prev, ...result.data.reviews]);
            setCursor(result.data.nextCursor);
        }
    }

    if (reviews.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center px-6">
                <Star className="size-10 text-muted-foreground" />
                <p className="text-muted-foreground text-sm">
                    Aucun avis pour le moment.
                </p>
            </div>
        );
    }

    return (
        <div className="divide-y">
            {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
            ))}
            {cursor && (
                <div className="flex justify-center px-6 py-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={loadMore}
                        disabled={query.isFetching}
                    >
                        {query.isFetching ? (
                            <>
                                <Loader2 className="size-4 animate-spin" />
                                Chargement...
                            </>
                        ) : (
                            "Charger plus"
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}

export function ReviewsDialog({
    userId,
    initialReviews,
    initialNextCursor,
    average,
    count,
    username,
}: ReviewsDialogProps) {
    return (
        <>
            {/* Desktop — Dialog (hidden on mobile) */}
            <Dialog>
                <DialogTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <button className="hidden sm:flex">
                        <ReviewsTrigger average={average} count={count} />
                    </button>
                </DialogTrigger>
                <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden">
                    <DialogHeader className="px-6 pt-6 pb-4 border-b">
                        <DialogTitle>Avis reçus par {username}</DialogTitle>
                        <ReviewsSummary average={average} count={count} />
                    </DialogHeader>
                    <ScrollArea className="max-h-[60vh]">
                        <ReviewsList
                            userId={userId}
                            initialReviews={initialReviews}
                            initialNextCursor={initialNextCursor}
                        />
                    </ScrollArea>
                </DialogContent>
            </Dialog>

            {/* Mobile — Drawer bottom sheet (hidden on desktop) */}
            <Drawer>
                <DrawerTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <button className="flex sm:hidden">
                        <ReviewsTrigger average={average} count={count} />
                    </button>
                </DrawerTrigger>
                <DrawerContent>
                    <DrawerHeader className="px-6 pb-4 border-b text-left">
                        <div className="flex items-center justify-between">
                            <DrawerTitle>Avis reçus par {username}</DrawerTitle>
                            <DrawerClose className="rounded-sm opacity-70 hover:opacity-100 transition-opacity">
                                <X className="size-5" />
                                <span className="sr-only">Fermer</span>
                            </DrawerClose>
                        </div>
                        <ReviewsSummary average={average} count={count} />
                    </DrawerHeader>
                    <ScrollArea className="max-h-[70svh] overflow-y-auto">
                        <ReviewsList
                            userId={userId}
                            initialReviews={initialReviews}
                            initialNextCursor={initialNextCursor}
                        />
                    </ScrollArea>
                </DrawerContent>
            </Drawer>
        </>
    );
}