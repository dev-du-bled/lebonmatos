"use client";

import Link from "next/link";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ListingCardProps {
    listing: {
        id: string;
        title: string;
        description: string | null;
        price: number;
        isSold: boolean;
        component: {
            id: string;
            name: string;
            type: string;
        };
        thumbnail: {
            id: string;
            image: string;
            alt: string | null;
        } | null;
    };
}

export function ListingCard({ listing }: ListingCardProps) {
    return (
        <Card
            className={cn(
                "overflow-hidden transition hover:border-primary hover:shadow-md p-0 gap-0 h-40 sm:h-40",
                listing.isSold &&
                    "opacity-60 hover:border-border hover:shadow-none"
            )}
        >
            <div className="flex flex-col sm:flex-row h-full">
                <Link
                    href={`/post/${listing.id}`}
                    className="relative h-40 w-full bg-secondary sm:h-40 sm:w-48 shrink-0"
                >
                    <Image
                        src={
                            listing.thumbnail?.image || "/images/fallback.webp"
                        }
                        alt={listing.thumbnail?.alt ?? listing.title}
                        fill
                        className={cn(
                            "h-full w-full object-cover",
                            listing.isSold && "grayscale"
                        )}
                    />
                    {listing.isSold && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/30">
                            <Badge
                                variant="secondary"
                                className="text-xs font-semibold shadow"
                            >
                                Vendu
                            </Badge>
                        </div>
                    )}
                </Link>
                <div className="flex flex-1 flex-col justify-between p-4 gap-4 h-full">
                    <Link href={`/post/${listing.id}`} className="space-y-1">
                        <div className="flex justify-between items-start gap-2">
                            <CardTitle className="text-base line-clamp-1">
                                {listing.title}
                            </CardTitle>
                            <span
                                className={cn(
                                    "text-lg font-bold shrink-0",
                                    listing.isSold
                                        ? "text-muted-foreground line-through"
                                        : "dark:text-primary"
                                )}
                            >
                                {listing.price.toLocaleString("fr-FR")} €
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {listing.component.name}
                        </p>
                        {listing.description && (
                            <CardDescription className="line-clamp-2 text-sm">
                                {listing.description}
                            </CardDescription>
                        )}
                    </Link>
                </div>
            </div>
        </Card>
    );
}
