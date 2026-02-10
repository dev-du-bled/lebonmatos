"use client";

import { useState, useEffect } from "react";
import { ComponentType } from "@prisma/client";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/trpc/client";
import {
    COMPONENT_TYPE_LABELS,
    ComponentWithDetails,
} from "@/lib/compatibility";
import { Search, Heart, Plus, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useDebouncedCallback } from "use-debounce";
import Link from "next/link";
import { formatComponentDetails } from "@/lib/utils";

export type SelectedPost = {
    id: string;
    title: string;
    price: number;
    images: string[];
    component: ComponentWithDetails;
};

type ComponentSelectorProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    componentType: ComponentType;
    onSelect: (post: SelectedPost) => void;
    isAuthenticated?: boolean;
};

export function ComponentSelector({
    open,
    onOpenChange,
    componentType,
    onSelect,
    isAuthenticated = false,
}: ComponentSelectorProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [activeTab, setActiveTab] = useState<"search" | "favorites">(
        "search"
    );

    const debouncedSetQuery = useDebouncedCallback((value: string) => {
        setDebouncedQuery(value);
    }, 300);

    // Reset on open
    useEffect(() => {
        if (open) {
            setSearchQuery("");
            setDebouncedQuery("");
            setActiveTab("search");
        }
    }, [open]);

    const searchQuery$ = trpc.configuration.searchPosts.useQuery(
        {
            componentType,
            query: debouncedQuery || undefined,
            limit: 20,
        },
        {
            enabled: open && activeTab === "search",
        }
    );

    const favoritesQuery$ = trpc.configuration.getFavoritePosts.useQuery(
        { componentType },
        {
            enabled: open && activeTab === "favorites" && isAuthenticated,
        }
    );

    const handleSelect = (post: SelectedPost) => {
        onSelect(post);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-full max-w-[95vw] sm:max-w-150 max-h-[85vh]">
                <DialogHeader>
                    <DialogTitle>
                        Sélectionner un{" "}
                        {COMPONENT_TYPE_LABELS[componentType].toLowerCase()}
                    </DialogTitle>
                </DialogHeader>

                <Tabs
                    value={activeTab}
                    onValueChange={(v) =>
                        setActiveTab(v as "search" | "favorites")
                    }
                    className="w-full"
                >
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger
                            value="search"
                            className="flex items-center gap-2"
                        >
                            <Search className="size-4" />
                            Recherche
                        </TabsTrigger>
                        <TabsTrigger
                            value="favorites"
                            className="flex items-center gap-2"
                            disabled={!isAuthenticated}
                        >
                            <Heart className="size-4" />
                            Favoris
                            {!isAuthenticated && (
                                <span className="text-xs text-muted-foreground">
                                    (connexion requise)
                                </span>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="search" className="mt-4">
                        <div className="space-y-4 w-full">
                            <Input
                                placeholder={`Rechercher un ${COMPONENT_TYPE_LABELS[componentType].toLowerCase()}...`}
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    debouncedSetQuery(e.target.value);
                                }}
                                className="w-full"
                            />

                            <ScrollArea className="h-100 -mr-4 pr-2">
                                <div className="w-full pr-2">
                                    {searchQuery$.isLoading ? (
                                        <div className="space-y-2 w-full">
                                            {Array.from({ length: 5 }).map(
                                                (_, i) => (
                                                    <Skeleton
                                                        key={i}
                                                        className="h-20 w-full"
                                                    />
                                                )
                                            )}
                                        </div>
                                    ) : searchQuery$.data?.length === 0 ? (
                                        <div className="text-center text-muted-foreground py-8">
                                            Aucune annonce trouvée
                                        </div>
                                    ) : (
                                        <div className="space-y-2 w-full">
                                            {searchQuery$.data?.map((post) => (
                                                <PostCard
                                                    key={post.id}
                                                    post={post as SelectedPost}
                                                    onSelect={handleSelect}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                    </TabsContent>

                    <TabsContent value="favorites" className="mt-4">
                        <ScrollArea className="h-100 -mr-4 pr-4">
                            {!isAuthenticated ? (
                                <div className="text-center text-muted-foreground py-8">
                                    Connectez-vous pour voir vos favoris
                                </div>
                            ) : favoritesQuery$.isLoading ? (
                                <div className="space-y-2 w-full pr-2">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Skeleton
                                            key={i}
                                            className="h-20 w-full"
                                        />
                                    ))}
                                </div>
                            ) : favoritesQuery$.data?.length === 0 ? (
                                <div className="text-center text-muted-foreground py-8">
                                    Aucun favori pour ce type de composant
                                </div>
                            ) : (
                                <div className="space-y-2 w-full pr-2">
                                    {favoritesQuery$.data?.map((post) => (
                                        <PostCard
                                            key={post.id}
                                            post={post as SelectedPost}
                                            onSelect={handleSelect}
                                        />
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}

function PostCard({
    post,
    onSelect,
}: {
    post: SelectedPost;
    onSelect: (post: SelectedPost) => void;
}) {
    const imageUrl = post.images?.[0];
    const details = formatComponentDetails(post.component);

    return (
        <div className="flex flex-col xs:flex-row items-start xs:items-center gap-3 xs:gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors w-full box-border min-w-0">
            <Link
                href={`/post/${post.id}`}
                target="blank"
                className="relative w-full xs:w-16 h-30 xs:h-16 shrink-0 bg-muted rounded-md overflow-hidden group"
            >
                <Image
                    src={imageUrl || "/images/fallback.webp"}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform"
                />
            </Link>

            <div className="flex-1 w-full">
                <div className="flex items-start justify-between gap-2 mb-1">
                    <Link
                        href={`/post/${post.id}`}
                        target="blank"
                        className="group flex gap-1 items-start"
                    >
                        <h4 className="font-medium group-hover:underline text-sm xs:text-base wrap-anywhere line-clamp-2">
                            {post.title}
                        </h4>
                        <ArrowUpRight className="size-4 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
                    </Link>
                    <p className="font-semibold shrink-0 xs:hidden whitespace-nowrap">
                        {post.price} &euro;
                    </p>
                </div>

                <p className="text-sm text-muted-foreground wrap-break-word">
                    {post.component.name}
                </p>
                <p className="text-xs text-muted-foreground wrap-break-word">
                    {details}
                </p>
            </div>

            <div className="flex xs:flex-col items-center xs:items-end gap-2 xs:gap-0 w-full xs:w-auto shrink-0">
                <p className="font-semibold hidden xs:block whitespace-nowrap">
                    {post.price} &euro;
                </p>
                <Button
                    size="sm"
                    className="w-full xs:w-auto xs:mt-1"
                    onClick={(e) => {
                        e.preventDefault();
                        onSelect(post);
                    }}
                >
                    <Plus className="size-4 mr-1" />
                    Ajouter
                </Button>
            </div>
        </div>
    );
}
