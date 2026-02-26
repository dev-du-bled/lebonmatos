"use client";

import Image from "next/image";
import { Trash, ArrowLeftRight, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Trend, formatSpecValue } from "./comparator-utils";
import { Annonce } from "./comparator-mapper";

interface Props {
    data: Annonce;
    index: number;
    allKeys: string[];
    nonNumericKeys: Set<string>;
    trends: Record<string, Record<string, Trend>>;
    onRemove: (id: string) => void;
    onReplace: (i: number) => void;
    humanizeKey: (k: string) => string;
}

export default function ComparatorCard({
    data,
    index,
    allKeys,
    nonNumericKeys,
    trends,
    onRemove,
    onReplace,
    humanizeKey,
}: Props) {
    function renderTrend(trend: Trend) {
        if (trend === "none") return null;
        const Icon = trend === "up" ? ArrowUp : ArrowDown;
        const color = trend === "up" ? "text-emerald-500" : "text-rose-600";
        return <Icon size={16} className={color} />;
    }

    return (
        <article className="border rounded-lg bg-background shadow-sm overflow-hidden">
            {/* IMAGE */}
            <div className="relative h-48">
                {data.imageSrc ? (
                    <Image src={data.imageSrc} alt={data.title} fill className="object-cover rounded-t-lg" />
                ) : (
                    <div className="h-full flex items-center justify-center bg-muted text-muted-foreground">
                        No Image
                    </div>
                )}
                {/* ACTIONS */}
                <div className="absolute top-3 right-3 flex gap-2">
                    <Button
                        size="icon"
                        variant="secondary"
                        onClick={() => onReplace(index)}
                        className="h-8 w-8 backdrop-blur-sm bg-background/80 hover:bg-background/90"
                    >
                        <ArrowLeftRight size={16} />
                    </Button>
                    <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => onRemove(data.id)}
                        className="h-8 w-8 backdrop-blur-sm"
                    >
                        <Trash size={16} />
                    </Button>
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/60 to-transparent p-4">
                    <h2 className="text-white font-bold text-xl">{data.title}</h2>
                </div>
            </div>

            {/* CONTENT */}
            <div className="p-4 space-y-3">
                {allKeys.map((key) => {
                    const value = data.specs?.[key];
                    const trend = trends[data.id]?.[key] ?? "none";
                    const formatted = formatSpecValue(key, value);

                    if (nonNumericKeys.has(key.toLowerCase())) {
                        return (
                            <div key={key} className="text-center py-2 border-b last:border-b-0">
                                <div className="font-semibold text-sm text-muted-foreground mb-1">
                                    {humanizeKey(key)}
                                </div>
                                <div className="font-medium">{formatted ?? "-"}</div>
                            </div>
                        );
                    }

                    return (
                        <div key={key} className="flex justify-between items-center py-2 border-b last:border-b-0">
                            <span className="text-sm font-medium text-muted-foreground">{humanizeKey(key)}</span>
                            <div className="flex items-center gap-2">
                                {renderTrend(trend)}
                                <span className="font-semibold">{formatted ?? "-"}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </article>
    );
}
