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
        if (trend === "mid")
            return <span className="text-orange-400 font-bold text-sm">—</span>;
        const Icon = trend === "up" ? ArrowUp : ArrowDown;
        const color = trend === "up" ? "text-emerald-500" : "text-rose-600";
        return <Icon size={16} className={color} />;
    }

    // Price is shown in the footer, not in the specs list
    const specKeys = allKeys.filter((k) => k !== "price");

    return (
        <article className="border rounded-lg bg-background shadow-sm overflow-hidden h-full flex flex-col">
            {/* IMAGE */}
            <div className="relative h-48">
                {data.imageSrc ? (
                    <Image
                        src={data.imageSrc}
                        alt={data.title}
                        fill
                        className="object-cover rounded-t-lg"
                    />
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
                    <h2 className="text-white font-bold text-xl">
                        {data.title}
                    </h2>
                </div>
            </div>

            {/* CONTENT */}
            <div
                className="p-4 grid gap-3 flex-1"
                style={{
                    gridTemplateRows: `repeat(${Math.max(specKeys.length, 1)}, minmax(0, 1fr))`,
                }}
            >
                {specKeys.map((key) => {
                    const value = data.specs?.[key];
                    const trend = trends[data.id]?.[key] ?? "none";
                    const formatted = formatSpecValue(key, value);
                    const isNonNumeric = nonNumericKeys.has(key.toLowerCase());

                    return (
                        <div
                            key={key}
                            className="flex flex-col items-center justify-center text-center"
                        >
                            <div className="font-semibold text-sm text-muted-foreground mb-1">
                                {humanizeKey(key)}
                            </div>
                            <div
                                className={`font-semibold flex items-center gap-2 ${isNonNumeric ? "text-base" : "text-lg"}`}
                            >
                                {!isNonNumeric && renderTrend(trend)}
                                <span>{formatted ?? "-"}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* FOOTER */}
            {data.price !== undefined && (
                <div className="px-4 py-3 flex items-center gap-2">
                    {renderTrend(trends[data.id]?.["price"] ?? "none")}
                    <span className="font-bold text-3xl">
                        {formatSpecValue("price", data.price as number)}
                    </span>
                </div>
            )}
        </article>
    );
}
