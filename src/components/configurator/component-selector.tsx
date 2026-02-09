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

    return (
        <div className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors w-full box-border min-w-0">
            <Link
                href={`/post/${post.id}`}
                target="blank"
                className="relative size-16 shrink-0 bg-muted rounded-md overflow-hidden group"
            >
                <Image
                    src={imageUrl || "/images/fallback.webp"}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform"
                />
            </Link>

            <div className="flex-1 min-w-0 overflow-hidden max-w-83.5">
                <Link
                    href={`/post/${post.id}`}
                    target="blank"
                    className="group flex gap-px items-center"
                >
                    <h4 className="font-medium truncate group-hover:underline">
                        {post.title}
                    </h4>
                    <ArrowUpRight className="size-4 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
                <p className="text-sm text-muted-foreground whitespace-break-spaces">
                    {post.component.name}
                </p>
                {post.component.Motherboard && (
                    <p className="text-xs text-muted-foreground truncate">
                        {post.component.Motherboard.socket} |{" "}
                        {post.component.Motherboard.formFactor} |{" "}
                        {post.component.Motherboard.memorySlots} slots |{" "}
                        {post.component.Motherboard.maxMemory} Go
                    </p>
                )}
                {post.component.Cpu && (
                    <p className="text-xs text-muted-foreground truncate">
                        {post.component.Cpu.microarch}
                        {post.component.Cpu.coreCount &&
                            ` | ${post.component.Cpu.coreCount} cœurs`}
                        {post.component.Cpu.coreClock &&
                            ` | ${post.component.Cpu.coreClock} GHz`}
                    </p>
                )}
                {post.component.Ram && (
                    <p className="text-xs text-muted-foreground truncate">
                        {post.component.Ram.type} | {post.component.Ram.modules}
                        x{post.component.Ram.size}Go |{" "}
                        {post.component.Ram.speed &&
                            `${post.component.Ram.speed} MHz`}{" "}
                        |{" "}
                    </p>
                )}
                {post.component.Gpu && (
                    <p className="text-xs text-muted-foreground truncate">
                        {post.component.Gpu.chipset} |{" "}
                        {post.component.Gpu.memory} Go | `$
                        {post.component.Gpu.coreClock} MHz` |{" "}
                        {post.component.Gpu.boostClock} MHz
                    </p>
                )}
                {post.component.Psu && (
                    <p className="text-xs text-muted-foreground truncate">
                        {post.component.Psu.wattage} W | Efficacité:{" "}
                        {post.component.Psu.efficiency || "N/A"} | Modulaire:{" "}
                        {post.component.Psu.modular || "N/A"}
                    </p>
                )}
                {post.component.Case && (
                    <p className="text-xs text-muted-foreground whitespace-break-spaces">
                        {post.component.Case.type} |{" "}
                        {post.component.Case.sidePanel || "N/A"} |{" "}
                        {post.component.Case.volume
                            ? `${post.component.Case.volume} L`
                            : "N/A"}
                        | {post.component.Case.bays3_5} Baies 3.5&quot;
                    </p>
                )}
            </div>

            <div className="text-right shrink-0">
                <p className="font-semibold">{post.price} &euro;</p>
                <Button
                    size="sm"
                    className="mt-1"
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
