"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TRPCClientError } from "@trpc/client";
import { Star, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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

export function ReviewForm({ userId }: { userId: string }) {
    const router = useRouter();
    const [hovered, setHovered] = useState(0);

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
                userId,
                rating: values.rating,
                comment: values.comment?.trim() || undefined,
            });
            toast.success("Avis publié avec succès !");
            router.push(`/profile/${userId}`);
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
                                <div className="flex flex-col gap-2">
                                    <div
                                        className="flex items-center gap-1"
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
                                                className="focus-visible:outline-none"
                                            >
                                                <Star
                                                    className={cn(
                                                        "size-8 transition-colors",
                                                        star <= displayRating
                                                            ? "fill-primary text-primary"
                                                            : "fill-muted text-muted-foreground"
                                                    )}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                    {displayRating > 0 && (
                                        <p className="text-sm text-muted-foreground">
                                            {LABELS[displayRating]}
                                        </p>
                                    )}
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
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Commentaire{" "}
                                <span className="text-muted-foreground font-normal">
                                    (optionnel)
                                </span>
                            </FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Décrivez votre expérience avec cet utilisateur..."
                                    className="resize-none"
                                    maxLength={500}
                                    {...field}
                                />
                            </FormControl>
                            <div className="flex justify-between items-center">
                                <FormMessage />
                                <p className="text-xs text-muted-foreground ml-auto">
                                    {(field.value ?? "").length} / 500
                                </p>
                            </div>
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
