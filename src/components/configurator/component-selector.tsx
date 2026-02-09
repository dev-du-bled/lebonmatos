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
import { Search, Heart, Plus, Loader2 } from "lucide-react";
import Image from "next/image";

export type SelectedPost = {
    id: string;
    title: string;
    description: string;
    price: number;
    images: string[];
    firstImage?: string;

    componentName: string;
    componentType: ComponentType;
    componentColor?: string;
    componentEstimatedPrice?: number;

    // Component-specific fields (flattened from Meilisearch)
    // Motherboard
    socket?: string;
    formFactor?: string;
    maxMemory?: number;
    memorySlots?: number;

    // CPU
    microarch?: string;
    coreCount?: number;
    coreClock?: number;
    boostClock?: number;

    // RAM
    ramType?: string;
    type?: string;
    speed?: number;
    modules?: number;
    size?: number;
    casLatency?: number;

    // GPU
    chipset?: string;
    memory?: number;
    length?: number;

    // SSD/HDD
    capacity?: number;
    cache?: number;
    interface?: string;

    // PSU
    psuType?: string;
    wattage?: number;
    efficiency?: string;
    modular?: string;

    // CPU Cooler / Case Fan
    rpmIdle?: number;
    rpmMax?: number;
    noiseIdle?: number;
    noiseMax?: number;
    airflowIdle?: number;
    airflowMax?: number;
    pwm?: boolean;

    // Case
    caseType?: string;
    sidePanel?: string;
    volume?: number;
    bays3_5?: number;

    // Sound Card
    channels?: number;
    digitalAudio?: string;
    snr?: number;
    sampleRate?: number;

    // Wireless Network Card
    protocol?: string;

    // User info
    userId?: string;
    userName?: string;
    componentId?: string;
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
                            <div className="relative">
                                <Input
                                    placeholder={`Rechercher un ${COMPONENT_TYPE_LABELS[componentType].toLowerCase()}...`}
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="w-full pr-10"
                                />
                                {(searchQuery$.isLoading ||
                                    searchQuery !== debouncedQuery) && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <Loader2 className="size-4 animate-spin text-muted-foreground" />
                                    </div>
                                )}
                            </div>

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
    const imageUrl = post.images?.[0] || post.firstImage;

    return (
        <div className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors w-full box-border min-w-0">
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

            <div className="flex-1 min-w-0 overflow-hidden">
                <h4 className="font-medium truncate w-full block">
                    {post.title}
                </h4>
                <p className="text-sm text-muted-foreground truncate w-full block">
                    {post.componentName}
                </p>
                {post.componentType === "MOTHERBOARD" && post.socket && (
                    <p className="text-xs text-muted-foreground truncate">
                        Socket: {post.socket} | {post.formFactor}
                    </p>
                )}
                {post.componentType === "CPU" && post.microarch && (
                    <p className="text-xs text-muted-foreground truncate">
                        {post.microarch}
                    </p>
                )}
                {post.componentType === "RAM" && post.ramType && (
                    <p className="text-xs text-muted-foreground truncate">
                        {post.ramType} | {post.modules}x{post.size}Go
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
