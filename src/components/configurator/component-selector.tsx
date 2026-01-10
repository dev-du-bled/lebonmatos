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
import { COMPONENT_TYPE_LABELS } from "@/lib/compatibility";
import { Search, Heart, Plus } from "lucide-react";
import Image from "next/image";

export type SelectedPost = {
    id: string;
    title: string;
    price: number;
    images: string[];
    component: {
        id: string;
        name: string;
        type: ComponentType;
        Cpu?: { microarch: string } | null;
        Motherboard?: {
            socket: string;
            formFactor: string;
            memorySlots: number;
            maxMemory: number;
        } | null;
        Ram?: { type: string | null; modules: number; size: number } | null;
        Case?: { type: string } | null;
        Psu?: { wattage: number } | null;
        Gpu?: { length: number | null } | null;
    };
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

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

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
            <DialogContent className="max-w-2xl max-h-[80vh]">
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
                        <div className="space-y-4">
                            <Input
                                placeholder={`Rechercher un ${COMPONENT_TYPE_LABELS[componentType].toLowerCase()}...`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full"
                            />

                            <ScrollArea className="h-[400px] pr-4">
                                {searchQuery$.isLoading ? (
                                    <div className="space-y-2">
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
                                    <div className="space-y-2">
                                        {searchQuery$.data?.map((post) => (
                                            <PostCard
                                                key={post.id}
                                                post={post as SelectedPost}
                                                onSelect={handleSelect}
                                            />
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </div>
                    </TabsContent>

                    <TabsContent value="favorites" className="mt-4">
                        <ScrollArea className="h-[400px] pr-4">
                            {!isAuthenticated ? (
                                <div className="text-center text-muted-foreground py-8">
                                    Connectez-vous pour voir vos favoris
                                </div>
                            ) : favoritesQuery$.isLoading ? (
                                <div className="space-y-2">
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
                                <div className="space-y-2">
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

    return (
        <div className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="relative size-16 shrink-0 bg-muted rounded-md overflow-hidden">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={post.title}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="size-full flex items-center justify-center text-muted-foreground text-xs">
                        Pas d&apos;image
                    </div>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">{post.title}</h4>
                <p className="text-sm text-muted-foreground truncate">
                    {post.component.name}
                </p>
                {post.component.Motherboard && (
                    <p className="text-xs text-muted-foreground">
                        Socket: {post.component.Motherboard.socket} |{" "}
                        {post.component.Motherboard.formFactor}
                    </p>
                )}
                {post.component.Cpu && (
                    <p className="text-xs text-muted-foreground">
                        {post.component.Cpu.microarch}
                    </p>
                )}
                {post.component.Ram && (
                    <p className="text-xs text-muted-foreground">
                        {post.component.Ram.type} | {post.component.Ram.modules}
                        x{post.component.Ram.size}Go
                    </p>
                )}
            </div>

            <div className="text-right shrink-0">
                <p className="font-semibold">{post.price} &euro;</p>
                <Button
                    size="sm"
                    className="mt-1"
                    onClick={() => onSelect(post)}
                >
                    <Plus className="size-4 mr-1" />
                    Ajouter
                </Button>
            </div>
        </div>
    );
}
