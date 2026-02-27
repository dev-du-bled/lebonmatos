"use client";

import Link from "next/link";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import Image from "next/image";

interface ListingCardProps {
    listing: {
        id: string;
        title: string;
        description: string | null;
        price: number;
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
        <Card className="overflow-hidden transition hover:border-primary hover:shadow-md p-0 gap-0">
            <div className="flex flex-col sm:flex-row">
                <Link
                    href={`/listing/${listing.id}`}
                    className="relative h-40 w-full bg-secondary sm:h-auto sm:w-48 shrink-0"
                >
                    <Image
                        src={listing.thumbnail?.image || "/images/fallback.webp"}
                        alt={listing.thumbnail?.alt ?? listing.title}
                        fill
                        className="h-full w-full object-cover"
                    />
                </Link>
                <div className="flex flex-1 flex-col justify-between p-4 gap-4">
                    <Link href={`/listing/${listing.id}`} className="space-y-1">
                        <div className="flex justify-between items-start gap-2">
                            <CardTitle className="text-base line-clamp-1">{listing.title}</CardTitle>
                            <span className="text-lg font-bold dark:text-primary shrink-0">
                                {listing.price.toLocaleString("fr-FR")} €
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{listing.component.name}</p>
                        {listing.description && (
                            <CardDescription className="line-clamp-2 text-sm">{listing.description}</CardDescription>
                        )}
                    </Link>
                </div>
            </div>
        </Card>
    );
}
