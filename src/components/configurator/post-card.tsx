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
        <div className="flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-3 border rounded-lg hover:bg-muted/50 transition-colors w-full overflow-hidden">
            {/* Image : rectangle plein largeur sur mobile, carré sur desktop */}
            <div className="relative w-full h-32 sm:w-16 sm:h-16 sm:shrink-0 bg-muted sm:rounded-md sm:m-2 overflow-hidden">
                <Image
                    src={imageUrl || "/images/fallback.webp"}
                    alt={post.title}
                    fill
                    className="object-cover"
                />
            </div>

            {/* Contenu + prix/bouton */}
            <div className="flex items-center gap-2 px-3 py-2 sm:py-2 sm:pl-0 sm:pr-3 flex-1 min-w-0">
                <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{post.title}</h4>
                    <p className="text-sm text-muted-foreground truncate">
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
