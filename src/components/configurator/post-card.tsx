"use client";

import { ComponentWithDetails } from "@/lib/compatibility";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Image from "next/image";

export type SelectedPost = {
    id: string;
    title: string;
    description?: string | null;
    price: number;
    images: string[];
    component: ComponentWithDetails;
    userId?: string;
    componentId?: string;
};

export function PostCard({
    post,
    onSelect,
}: {
    post: SelectedPost;
    onSelect?: (post: SelectedPost) => void;
}) {
    const imageUrl = post.images?.[0];
    const componentType = post.component.type;

    return (
        <div className="flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-3 border rounded-lg hover:bg-muted/50 transition-colors w-full overflow-hidden">
            <div className="relative w-full h-32 sm:w-16 sm:h-16 sm:shrink-0 bg-muted sm:rounded-md sm:m-2 overflow-hidden">
                <Image
                    src={imageUrl || "/images/fallback.webp"}
                    alt={post.title}
                    fill
                    className="object-cover"
                />
            </div>

            <div className="flex items-center gap-2 px-3 py-2 sm:py-2 sm:pl-0 sm:pr-3 flex-1 min-w-0">
                <div className="flex-1 min-w-0">
                    <h4 className="font-medium line-clamp-2 break-all">{post.title}</h4>
                    <p className="text-sm text-muted-foreground truncate">
                        {post.component.name}
                    </p>
                    {componentType === "MOTHERBOARD" &&
                        post.component.Motherboard?.socket && (
                            <p className="text-xs text-muted-foreground truncate">
                                Socket: {post.component.Motherboard.socket} |{" "}
                                {post.component.Motherboard.formFactor}
                            </p>
                        )}
                    {componentType === "CPU" &&
                        post.component.Cpu?.microarch && (
                            <p className="text-xs text-muted-foreground truncate">
                                {post.component.Cpu.microarch}
                            </p>
                        )}
                    {componentType === "RAM" && post.component.Ram?.type && (
                        <p className="text-xs text-muted-foreground truncate">
                            {post.component.Ram.type} |{" "}
                            {post.component.Ram.modules}x
                            {post.component.Ram.size}
                            Go
                        </p>
                    )}
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                    <p className="font-bold text-base">{post.price} &euro;</p>
                    {onSelect && (
                        <Button
                            size="icon"
                            className="size-7 sm:w-auto sm:px-3 sm:h-8 sm:text-xs"
                            onClick={() => onSelect(post)}
                        >
                            <Plus className="size-3.5 sm:mr-1" />
                            <span className="hidden sm:inline">Ajouter</span>
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
