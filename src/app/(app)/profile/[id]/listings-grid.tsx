"use client";

import { useState, useMemo } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ListingCard } from "./listing-card";

type Listing = {
    id: string;
    title: string;
    description: string | null;
    price: number;
    isSold: boolean;
    createdAt: string;
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

type SortKey = "date-desc" | "date-asc" | "price-asc" | "price-desc";

const SORT_OPTIONS: { value: SortKey; label: string; icon: React.ReactNode }[] =
    [
        {
            value: "date-desc",
            label: "Plus récent",
            icon: <ArrowDown className="size-3.5" />,
        },
        {
            value: "date-asc",
            label: "Plus ancien",
            icon: <ArrowUp className="size-3.5" />,
        },
        {
            value: "price-asc",
            label: "Prix croissant",
            icon: <ArrowUp className="size-3.5" />,
        },
        {
            value: "price-desc",
            label: "Prix décroissant",
            icon: <ArrowDown className="size-3.5" />,
        },
    ];

function sortListings(listings: Listing[], sort: SortKey): Listing[] {
    return [...listings].sort((a, b) => {
        switch (sort) {
            case "date-desc":
                return b.createdAt < a.createdAt
                    ? -1
                    : b.createdAt > a.createdAt
                      ? 1
                      : 0;
            case "date-asc":
                return a.createdAt < b.createdAt
                    ? -1
                    : a.createdAt > b.createdAt
                      ? 1
                      : 0;
            case "price-asc":
                return a.price - b.price;
            case "price-desc":
                return b.price - a.price;
        }
    });
}

export function ListingsGrid({ listings }: { listings: Listing[] }) {
    const [sort, setSort] = useState<SortKey>("date-desc");

    const { active, sold } = useMemo(() => {
        const sorted = sortListings(listings, sort);
        return {
            active: sorted.filter((l) => !l.isSold),
            sold: sorted.filter((l) => l.isSold),
        };
    }, [listings, sort]);

    const currentLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label;

    return (
        <div className="space-y-8">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-muted-foreground">
                    {active.length} annonce{active.length !== 1 ? "s" : ""}{" "}
                    active
                    {active.length !== 1 ? "s" : ""}
                    {sold.length > 0 && (
                        <span className="ml-1 text-muted-foreground/60">
                            · {sold.length} vendue{sold.length !== 1 ? "s" : ""}
                        </span>
                    )}
                </p>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 text-xs"
                        >
                            <ArrowUpDown className="size-3.5" />
                            {currentLabel}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuRadioGroup
                            value={sort}
                            onValueChange={(v) => setSort(v as SortKey)}
                        >
                            {SORT_OPTIONS.map((option) => (
                                <DropdownMenuRadioItem
                                    key={option.value}
                                    value={option.value}
                                >
                                    <span className="flex items-center gap-2">
                                        {option.icon}
                                        {option.label}
                                    </span>
                                </DropdownMenuRadioItem>
                            ))}
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Active listings */}
            {active.length > 0 && (
                <div className="grid gap-4">
                    {active.map((listing) => (
                        <ListingCard key={listing.id} listing={listing} />
                    ))}
                </div>
            )}

            {/* Sold listings */}
            {sold.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <p className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                            Annonces vendues
                        </p>
                        <div className="h-px flex-1 bg-border" />
                    </div>
                    <div className="grid gap-4">
                        {sold.map((listing) => (
                            <ListingCard key={listing.id} listing={listing} />
                        ))}
                    </div>
                </div>
            )}

            {/* Fully empty */}
            {active.length === 0 && sold.length === 0 && null}
        </div>
    );
}
