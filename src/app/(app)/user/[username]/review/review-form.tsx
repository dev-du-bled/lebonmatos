"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TRPCClientError } from "@trpc/client";
import { Star, Loader2, ShoppingBag, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { TextareaWithCount } from "@/components/ui/textarea-with-count";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";

const reviewSchema = z.object({
    rating: z.number().int().min(1, "Veuillez sélectionner une note.").max(5),
    comment: z
        .string()
        .max(500, "Le commentaire ne peut pas dépasser 500 caractères.")
        .optional(),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

const LABELS: Record<number, string> = {
    1: "Très mauvais",
    2: "Mauvais",
    3: "Correct",
    4: "Bien",
    5: "Excellent",
};

// ─── Purchase gate ────────────────────────────────────────────────────────────

function NoPurchaseGate({ postId }: { postId: string }) {
    return (
        <div className="flex flex-col items-center gap-5 rounded-xl border border-dashed bg-muted/30 px-6 py-12 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-secondary">
                <ShoppingBag className="size-7 text-muted-foreground" />
            </div>
            <div className="space-y-1.5">
                <h3 className="font-semibold text-base">
                    Achat requis pour laisser un avis
                </h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                    Vous devez avoir acheté cette annonce pour pouvoir noter le
                    vendeur.
                </p>
            </div>
            <Link
                href={`/post/${postId}`}
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 h-9 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors"
            >
                Voir l&apos;annonce
            </Link>
        </div>
    );
}

function AlreadyReviewedGate() {
    return (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed bg-muted/30 px-6 py-12 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-secondary">
                <AlertCircle className="size-7 text-muted-foreground" />
            </div>
            <div className="space-y-1.5">
                <h3 className="font-semibold text-base">Avis déjà publié</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                    Vous avez déjà laissé un avis pour cette transaction.
                </p>
            </div>
            <Link
                href="/profile/reviews"
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 h-9 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors"
            >
                Voir mes avis
            </Link>
        </div>
    );
}

// ─── Main form ────────────────────────────────────────────────────────────────

export function ReviewForm({
    postId,
    backHref,
}: {
    postId: string;
    backHref?: string;
}) {
    const router = useRouter();
    const [hovered, setHovered] = useState(0);

    // Verify the current user has a completed purchase for this post
    const { data: eligibility, isLoading: isCheckingEligibility } =
        trpc.user.getReviewEligibility.useQuery({ postId });

    const mutation = trpc.user.addReview.useMutation();

    const form = useForm<ReviewFormValues>({
        resolver: zodResolver(reviewSchema),
        defaultValues: {
            rating: 0,
            comment: "",
        },
    });

    const selectedRating = form.watch("rating");

    async function onSubmit(values: ReviewFormValues) {
        try {
            await mutation.mutateAsync({
                postId,
                rating: values.rating,
                comment: values.comment?.trim() || undefined,
            });
            toast.success("Avis publié avec succès !");
            router.push(backHref ?? "/");
            router.refresh();
        } catch (error) {
            if (error instanceof TRPCClientError) {
                toast.error(error.message);
            } else {
                toast.error("Une erreur est survenue. Veuillez réessayer.");
            }
        }
    }

    const displayRating = hovered || selectedRating;

    // ── Loading state ──────────────────────────────────────────────────────────
    if (isCheckingEligibility) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    // ── Not purchased ──────────────────────────────────────────────────────────
    if (!eligibility?.hasPurchased) {
        return <NoPurchaseGate postId={postId} />;
    }

    // ── Already reviewed ───────────────────────────────────────────────────────
    if (eligibility?.hasAlreadyReviewed) {
        return <AlreadyReviewedGate />;
    }

    // ── Form ───────────────────────────────────────────────────────────────────
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Star picker */}
                <FormField
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Note</FormLabel>
                            <FormControl>
                                <div className="flex flex-col gap-3">
                                    <div
                                        className="flex items-center gap-2"
                                        onMouseLeave={() => setHovered(0)}
                                    >
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                aria-label={`${star} ${star === 1 ? "étoile" : "étoiles"}`}
                                                aria-pressed={
                                                    selectedRating === star
                                                }
                                                onClick={() =>
                                                    field.onChange(star)
                                                }
                                                onMouseEnter={() =>
                                                    setHovered(star)
                                                }
                                                className={cn(
                                                    "transition-transform duration-100 focus-visible:outline-none",
                                                    star <= displayRating
                                                        ? "scale-110"
                                                        : "scale-100"
                                                )}
                                            >
                                                <Star
                                                    className={cn(
                                                        "size-9 transition-colors duration-100",
                                                        star <= displayRating
                                                            ? "fill-primary text-primary"
                                                            : "fill-muted text-muted-foreground"
                                                    )}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                    <p
                                        className={cn(
                                            "text-sm font-medium text-muted-foreground h-5 transition-opacity duration-150",
                                            displayRating === 0
                                                ? "opacity-0"
                                                : "opacity-100"
                                        )}
                                    >
                                        {LABELS[displayRating] ?? ""}
                                    </p>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Comment */}
                <FormField
                    control={form.control}
                    name="comment"
                    render={({ field, fieldState }) => (
                        <FormItem>
                            <FormLabel>
                                Commentaire{" "}
                                <span className="text-muted-foreground font-normal">
                                    (optionnel)
                                </span>
                            </FormLabel>
                            <FormControl>
                                <TextareaWithCount
                                    placeholder="Décrivez votre expérience avec cet utilisateur..."
                                    className="resize-none min-h-25"
                                    maxLength={500}
                                    error={fieldState.error?.message}
                                    {...field}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <Button
                    type="submit"
                    className="w-full"
                    disabled={mutation.isPending || selectedRating === 0}
                >
                    {mutation.isPending ? (
                        <>
                            <Loader2 className="size-4 animate-spin" />
                            Publication...
                        </>
                    ) : (
                        "Publier l'avis"
                    )}
                </Button>
            </form>
        </Form>
    );
}
