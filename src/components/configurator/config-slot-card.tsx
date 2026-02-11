"use client";

import { ComponentType } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    COMPONENT_TYPE_LABELS,
    MULTI_QUANTITY_TYPES,
    type CompatibilityIssue,
} from "@/lib/compatibility";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import Image from "next/image";
import type { SelectedPost } from "./component-selector";
import { formatComponentDetails } from "@/lib/utils";

type ConfigSlotCardProps = {
    componentType: ComponentType;
    post: SelectedPost | null;
    quantity: number;
    issues: CompatibilityIssue[];
    onOpenSelector: (type: ComponentType) => void;
    onRemove: (type: ComponentType) => void;
    onQuantityChange: (type: ComponentType, quantity: number) => void;
    isLoading?: boolean;
};

export function ConfigSlotCard({
    componentType,
    post,
    quantity,
    issues,
    onOpenSelector,
    onRemove,
    onQuantityChange,
    isLoading,
}: ConfigSlotCardProps) {
    if (isLoading) {
        return (
            <Card className="p-0 gap-0">
                <CardHeader className="py-3 px-4 gap-0">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                            {COMPONENT_TYPE_LABELS[componentType]}
                        </CardTitle>
                    </div>
                </CardHeader>
                <Separator />
                <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                        <Skeleton className="size-20 rounded-lg shrink-0" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                        <Skeleton className="h-8 w-16" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    const isMulti = MULTI_QUANTITY_TYPES.includes(componentType);
    const hasError = issues.some((i) => i.type === "error");

    return (
        <Card
            className={`transition-all hover:shadow-md p-0 gap-0 ${hasError ? "border-destructive border-2" : ""}`}
        >
            <CardHeader className="py-3 px-4 gap-0">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex gap-2 items-center">
                        {COMPONENT_TYPE_LABELS[componentType]}
                        {hasError && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="cursor-help inline-flex items-center justify-center rounded-full bg-destructive/10 p-1 text-destructive">
                                        <AlertCircle className="size-4" />
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <div className="text-sm font-normal max-w-xs">
                                        {issues.map((issue, i) => (
                                            <p
                                                key={i}
                                                className="mb-1 last:mb-0"
                                            >
                                                {issue.message}
                                            </p>
                                        ))}
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        )}
                    </CardTitle>
                    {(!post || isMulti) && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onOpenSelector(componentType)}
                        >
                            <Plus className="size-4" />
                        </Button>
                    )}
                </div>
            </CardHeader>
            <Separator />
            <CardContent className="p-4">
                {post ? (
                    <div className="flex flex-col xs:flex-row xs:items-center gap-4">
                        <div className="relative h-35 xs:size-20 w-full shrink-0 bg-muted rounded-lg overflow-hidden border">
                            <Image
                                src={post.images[0] || "/images/fallback.webp"}
                                alt={post.title}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="flex-1 space-y-1">
                            <p className="font-medium wrap-anywhere line-clamp-2 text-base">
                                {post.title}
                            </p>
                            <p className="text-sm text-muted-foreground wrap-break-word">
                                {post.component.name}
                            </p>
                            <p className="text-sm text-muted-foreground wrap-break-word">
                                {formatComponentDetails(post.component)}
                            </p>
                        </div>
                        <div className="flex items-center justify-end gap-4">
                            {isMulti && (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">
                                        x
                                    </span>
                                    <Input
                                        type="number"
                                        min={1}
                                        max={10}
                                        value={quantity}
                                        onChange={(e) =>
                                            onQuantityChange(
                                                componentType,
                                                parseInt(e.target.value)
                                            )
                                        }
                                        className="w-16 text-center"
                                    />
                                </div>
                            )}
                            <div className="text-right shrink-0">
                                <p className="font-semibold text-lg">
                                    {post.price * quantity} €
                                </p>
                                {isMulti && (
                                    <p className="text-xs text-muted-foreground">
                                        {post.price} € / unité
                                    </p>
                                )}
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-destructive transition-colors"
                                onClick={() => onRemove(componentType)}
                            >
                                <Trash2 className="size-4" />
                            </Button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => onOpenSelector(componentType)}
                        className="w-full py-6 border-2 border-dashed rounded-lg text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2 group"
                    >
                        <div className="size-8 rounded-full bg-muted group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                            <Plus className="size-4" />
                        </div>
                        <span className="font-medium">
                            Ajouter un{" "}
                            {COMPONENT_TYPE_LABELS[componentType].toLowerCase()}
                        </span>
                    </button>
                )}
            </CardContent>
        </Card>
    );
}
