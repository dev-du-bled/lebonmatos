"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { create } from "zustand";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface LightboxStore {
    images: string[];
    index: number;
    isOpen: boolean;
    open: (images: string[], startIndex?: number) => void;
    close: () => void;
    prev: () => void;
    next: () => void;
    goTo: (index: number) => void;
}

export const useLightboxStore = create<LightboxStore>((set, get) => ({
    images: [],
    index: 0,
    isOpen: false,
    open: (images, startIndex = 0) =>
        set({ images, index: startIndex, isOpen: true }),
    close: () => set({ isOpen: false }),
    prev: () => {
        const { index, images } = get();
        set({ index: (index - 1 + images.length) % images.length });
    },
    next: () => {
        const { index, images } = get();
        set({ index: (index + 1) % images.length });
    },
    goTo: (index) => set({ index }),
}));

export function useLightbox() {
    return useLightboxStore((s) => s.open);
}

function LightboxImage({ src }: { src: string }) {
    const [isLoading, setIsLoading] = useState(true);

    // Reset au changement d'image (src change = nouvelle image)
    useEffect(() => {
        setIsLoading(true);
    }, [src]);

    return (
        <div className="relative flex items-center justify-center">
            {isLoading && (
                <Skeleton className="absolute h-64 w-96 rounded-xl bg-white/10" />
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={src}
                alt=""
                className={cn(
                    "max-h-[80vh] max-w-[85vw] select-none rounded-xl object-contain shadow-2xl transition-opacity duration-200",
                    isLoading ? "opacity-0" : "opacity-100"
                )}
                onLoad={() => setIsLoading(false)}
                onClick={(e) => e.stopPropagation()}
                draggable={false}
            />
        </div>
    );
}

function Thumbnail({
    src,
    active,
    onClick,
}: {
    src: string;
    active: boolean;
    onClick: () => void;
}) {
    const [isLoading, setIsLoading] = useState(true);

    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
            className={cn(
                "relative size-14 shrink-0 overflow-hidden rounded-lg border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
                active
                    ? "border-white opacity-100 scale-105"
                    : "border-white/20 opacity-50 hover:opacity-80"
            )}
        >
            {isLoading && (
                <Skeleton className="absolute inset-0 rounded-none bg-white/10" />
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={src}
                alt=""
                className={cn(
                    "h-full w-full object-cover transition-opacity duration-150",
                    isLoading ? "opacity-0" : "opacity-100"
                )}
                onLoad={() => setIsLoading(false)}
            />
        </button>
    );
}

function LightboxOverlay() {
    const { images, index, isOpen, close, prev, next, goTo } =
        useLightboxStore();
    const hasMultiple = images.length > 1;

    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") close();
            else if (e.key === "ArrowLeft") prev();
            else if (e.key === "ArrowRight") next();
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [isOpen, close, prev, next]);

    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    if (!isOpen || images.length === 0) return null;

    return (
        <div
            className="fixed inset-0 z-200 flex flex-col items-center justify-center gap-4 bg-black/92 backdrop-blur-sm"
            onClick={close}
        >
            {/* Barre supérieure */}
            <div
                className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Compteur */}
                {hasMultiple ? (
                    <span className="text-sm font-medium text-white/60">
                        {index + 1} / {images.length}
                    </span>
                ) : (
                    <span />
                )}

                {/* Fermer */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-white/70 hover:text-white hover:bg-white/10"
                    onClick={close}
                    aria-label="Fermer"
                >
                    <X />
                </Button>
            </div>

            {/* Zone image avec flèches */}
            <div
                className="flex items-center gap-3 px-16"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Flèche gauche */}
                <Button
                    variant="ghost"
                    size="icon-lg"
                    className={cn(
                        "shrink-0 text-white/70 hover:text-white hover:bg-white/10",
                        !hasMultiple && "invisible"
                    )}
                    onClick={prev}
                    aria-label="Image précédente"
                >
                    <ChevronLeft className="size-6" />
                </Button>

                {/* Image */}
                <LightboxImage src={images[index]!} />

                {/* Flèche droite */}
                <Button
                    variant="ghost"
                    size="icon-lg"
                    className={cn(
                        "shrink-0 text-white/70 hover:text-white hover:bg-white/10",
                        !hasMultiple && "invisible"
                    )}
                    onClick={next}
                    aria-label="Image suivante"
                >
                    <ChevronRight className="size-6" />
                </Button>
            </div>

            {/* Bande de miniatures */}
            {hasMultiple && (
                <div
                    className="flex gap-2 pb-4"
                    onClick={(e) => e.stopPropagation()}
                >
                    {images.map((url, i) => (
                        <Thumbnail
                            key={i}
                            src={url}
                            active={i === index}
                            onClick={() => goTo(i)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export function Lightbox() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    return mounted ? createPortal(<LightboxOverlay />, document.body) : null;
}
