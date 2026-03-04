"use client";

import { ComponentType } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Image from "next/image";

export type SelectedPost = {
    id: string;
    title: string;
    description: string;
    price: number;
    images: string[];

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

export function PostCard({
    post,
    onSelect,
}: {
    post: SelectedPost;
    onSelect?: (post: SelectedPost) => void;
}) {
    const imageUrl = post.images?.[0];

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
                {onSelect && (
                    <Button
                        size="sm"
                        className="mt-1"
                        onClick={() => onSelect(post)}
                    >
                        <Plus className="size-4 mr-1" />
                        Ajouter
                    </Button>
                )}
            </div>
        </div>
    );
}
