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
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/trpc/client";
import { COMPONENT_TYPE_LABELS } from "@/lib/compatibility";
import { Search, Heart, Loader2 } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";

import {
    PostCard,
    type SelectedPost,
} from "@/components/configurator/post-card";
export type { SelectedPost };

type ComponentSelectorProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    componentType: ComponentType;
    onSelect: (post: SelectedPost) => void;
    isAuthenticated?: boolean;
    excludePostIds?: string[];
};

export function ComponentSelector({
    open,
    onOpenChange,
    componentType,
    onSelect,
    isAuthenticated = false,
    excludePostIds = [],
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

    // Filter out excluded posts from search results
    const filteredSearchResults = searchQuery$.data?.filter(
        (post) => !excludePostIds.includes(post.id)
    );

    // Filter out excluded posts from favorites
    const filteredFavorites = favoritesQuery$.data?.filter(
        (post) => !excludePostIds.includes(post.id)
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-full max-w-[95vw] sm:max-w-150">
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
                    <TabsList className="w-full">
                        <TabsTrigger
                            value="search"
                            className="flex items-center gap-2"
                        >
                            <Search className="size-4" />
                            Recherche
                        </TabsTrigger>
                        {isAuthenticated && (
                            <TabsTrigger
                                value="favorites"
                                className="flex items-center gap-2"
                            >
                                <Heart className="size-4" />
                                Favoris
                            </TabsTrigger>
                        )}
                    </TabsList>

                    <TabsContent
                        value="search"
                        className="mt-4 min-h-[calc(40vh+3.25rem)]"
                    >
                        <div className="space-y-3">
                            <div className="relative">
                                <Input
                                    placeholder={`Rechercher un ${COMPONENT_TYPE_LABELS[componentType].toLowerCase()}...`}
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        debouncedSetQuery(e.target.value);
                                    }}
                                    className="w-full pr-10"
                                />
                                {(searchQuery$.isLoading ||
                                    searchQuery !== debouncedQuery) && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <Loader2 className="size-4 animate-spin text-muted-foreground" />
                                    </div>
                                )}
                            </div>

                            <ScrollArea className="h-[40vh] -mr-4 pr-1">
                                <div className="space-y-2 pr-3">
                                    {searchQuery$.isLoading ? (
                                        <>
                                            {Array.from({ length: 5 }).map(
                                                (_, i) => (
                                                    <Skeleton
                                                        key={i}
                                                        className="h-20 w-full"
                                                    />
                                                )
                                            )}
                                        </>
                                    ) : filteredSearchResults?.length === 0 ? (
                                        <div className="text-center text-muted-foreground py-8">
                                            {excludePostIds.length > 0 &&
                                            searchQuery$.data?.length !== 0
                                                ? "Tous les composants disponibles sont déjà ajoutés"
                                                : "Aucune annonce trouvée"}
                                        </div>
                                    ) : (
                                        filteredSearchResults?.map((post) => (
                                            <PostCard
                                                key={post.id}
                                                post={post as SelectedPost}
                                                onSelect={handleSelect}
                                            />
                                        ))
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                    </TabsContent>

                    <TabsContent
                        value="favorites"
                        className="mt-4 min-h-[calc(40vh+3.25rem)]"
                    >
                        <ScrollArea className="h-[40vh] -mr-4 pr-1">
                            <div className="space-y-2 pr-3">
                                {!isAuthenticated ? (
                                    <div className="text-center text-muted-foreground py-8">
                                        Connectez-vous pour voir vos favoris
                                    </div>
                                ) : favoritesQuery$.isLoading ? (
                                    <>
                                        {Array.from({ length: 5 }).map(
                                            (_, i) => (
                                                <Skeleton
                                                    key={i}
                                                    className="h-20 w-full"
                                                />
                                            )
                                        )}
                                    </>
                                ) : filteredFavorites?.length === 0 ? (
                                    <div className="text-center text-muted-foreground py-8">
                                        {excludePostIds.length > 0 &&
                                        favoritesQuery$.data?.length !== 0
                                            ? "Tous vos favoris sont déjà ajoutés"
                                            : "Aucun favori pour ce type de composant"}
                                    </div>
                                ) : (
                                    filteredFavorites?.map((post) => (
                                        <PostCard
                                            key={post.id}
                                            post={
                                                {
                                                    ...post,
                                                    componentName:
                                                        post.component.name,
                                                    componentType:
                                                        post.component.type,
                                                } as unknown as SelectedPost
                                            }
                                            onSelect={handleSelect}
                                        />
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
