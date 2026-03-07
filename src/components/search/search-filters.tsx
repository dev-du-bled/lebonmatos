"use client";

import { memo, useState, useRef, useCallback, forwardRef } from "react";
import { Filter, ChevronRight, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Label } from "../ui/label";

const PRICE_MAX_DEFAULT = 2000;

function useFilterPopovers<T extends string>(keys: T[]) {
    const [activeKey, setActiveKey] = useState<T | null>(null);
    const [pinned, setPinned] = useState(false);
    const closeTimer = useRef<ReturnType<typeof setTimeout>>(null);
    const clickedTrigger = useRef(false);

    const clearTimer = useCallback(() => {
        if (closeTimer.current) {
            clearTimeout(closeTimer.current);
            closeTimer.current = null;
        }
    }, []);

    const getProps = useCallback(
        (key: T) => {
            const open = activeKey === key;

            const triggerProps = {
                onMouseEnter: () => {
                    clearTimer();
                    if (!pinned) {
                        setActiveKey(key);
                    }
                },
                onMouseLeave: () => {
                    if (!pinned) {
                        closeTimer.current = setTimeout(
                            () => setActiveKey(null),
                            150
                        );
                    }
                },
                onClick: (e: React.MouseEvent) => {
                    e.preventDefault();
                    clickedTrigger.current = true;
                    if (pinned && activeKey === key) {
                        setPinned(false);
                        setActiveKey(null);
                    } else {
                        setActiveKey(key);
                        setPinned(true);
                    }
                },
            };

            const contentProps = {
                onMouseEnter: () => clearTimer(),
                onMouseLeave: () => {
                    if (!pinned) {
                        closeTimer.current = setTimeout(
                            () => setActiveKey(null),
                            150
                        );
                    }
                },
            };

            const onOpenChange = (next: boolean) => {
                if (clickedTrigger.current) {
                    clickedTrigger.current = false;
                    return;
                }
                if (!next) {
                    setPinned(false);
                    setActiveKey(null);
                    clearTimer();
                }
            };

            return { open, onOpenChange, triggerProps, contentProps };
        },
        [activeKey, pinned, clearTimer]
    );

    const reset = useCallback(() => {
        setActiveKey(null);
        setPinned(false);
        clearTimer();
    }, [clearTimer]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const popovers = Object.fromEntries(
        keys.map((k) => [k, getProps(k)])
    ) as Record<T, ReturnType<typeof getProps>>;

    return { ...popovers, reset };
}

function ActiveDot({
    visible,
    className,
}: {
    visible: boolean;
    className?: string;
}) {
    return (
        <Circle
            className={cn(
                "size-2 fill-primary text-primary",
                visible ? "opacity-100" : "opacity-0",
                className
            )}
        />
    );
}

const FilterMenuItem = forwardRef<
    HTMLButtonElement,
    {
        label: string;
        active: boolean;
        className?: string;
    } & React.ButtonHTMLAttributes<HTMLButtonElement>
>(function FilterMenuItem({ label, active, className, ...props }, ref) {
    return (
        <button
            ref={ref}
            className={cn(
                "w-full flex items-center justify-between px-4 py-3 text-sm font-sans hover:bg-accent transition-colors",
                className
            )}
            {...props}
        >
            <span>{label}</span>
            <span className="flex items-center gap-1.5">
                {active && <ActiveDot visible />}
                <ChevronRight className="size-4 text-muted-foreground" />
            </span>
        </button>
    );
});

function PriceRangeInput({
    value,
    min,
    max,
    onChange,
}: {
    value: number;
    min: number;
    max: number;
    onChange: (value: number) => void;
}) {
    return (
        <div className="flex items-center gap-1">
            <Input
                type="number"
                value={value}
                min={min}
                max={max}
                onChange={(e) => {
                    const raw = e.target.value;
                    if (raw === "") {
                        return;
                    }
                    const parsed = Number(raw);
                    if (Number.isNaN(parsed)) {
                        return;
                    }
                    onChange(parsed);
                }}
                className="h-7 w-20 text-xs px-2"
            />
            <span className="text-xs text-muted-foreground">€</span>
        </div>
    );
}

export const PriceFilterContent = memo(function PriceFilterContent({
    priceRange,
    onPriceRangeChange,
    onPriceActiveChange,
}: {
    priceRange: [number, number];
    onPriceRangeChange: (range: [number, number]) => void;
    onPriceActiveChange: (active: boolean) => void;
}) {
    return (
        <>
            <Slider
                value={priceRange}
                onValueChange={(v) => {
                    onPriceRangeChange(v as [number, number]);
                    onPriceActiveChange(true);
                }}
                min={0}
                max={PRICE_MAX_DEFAULT}
                step={10}
            />
            <div className="flex justify-between mt-3 gap-2">
                <PriceRangeInput
                    value={priceRange[0]}
                    min={0}
                    max={priceRange[1]}
                    onChange={(val) => {
                        const clamped = Math.max(
                            0,
                            Math.min(val, priceRange[1])
                        );
                        onPriceRangeChange([clamped, priceRange[1]]);
                        onPriceActiveChange(true);
                    }}
                />
                <PriceRangeInput
                    value={priceRange[1]}
                    min={priceRange[0]}
                    max={PRICE_MAX_DEFAULT}
                    onChange={(val) => {
                        const clamped = Math.min(
                            PRICE_MAX_DEFAULT,
                            Math.max(val, priceRange[0])
                        );
                        onPriceRangeChange([priceRange[0], clamped]);
                        onPriceActiveChange(true);
                    }}
                />
            </div>
        </>
    );
});

const PriceFilter = memo(function PriceFilter({
    priceRange,
    onPriceRangeChange,
    onPriceActiveChange,
    contentProps,
}: {
    priceRange: [number, number];
    onPriceRangeChange: (range: [number, number]) => void;
    onPriceActiveChange: (active: boolean) => void;
    contentProps?: React.HTMLAttributes<HTMLDivElement>;
}) {
    return (
        <PopoverContent
            side="left"
            align="start"
            className="w-64"
            {...contentProps}
        >
            <p className="text-sm font-sans font-medium mb-4">Prix</p>
            <PriceFilterContent
                priceRange={priceRange}
                onPriceRangeChange={onPriceRangeChange}
                onPriceActiveChange={onPriceActiveChange}
            />
        </PopoverContent>
    );
});

export const ColorFilterContent = memo(function ColorFilterContent({
    availableColors,
    selectedColors,
    onSelectedColorsChange,
}: {
    availableColors: string[];
    selectedColors: string[];
    onSelectedColorsChange: (colors: string[]) => void;
}) {
    return (
        <>
            <div className="grid grid-cols-1 gap-1.5 mt-1 max-h-60 overflow-y-auto pr-1">
                {availableColors.map((color) => (
                    <Label
                        key={color}
                        className="flex items-center gap-2 text-sm font-sans whitespace-nowrap cursor-pointer"
                    >
                        <Checkbox
                            checked={selectedColors.includes(color)}
                            onCheckedChange={(checked) => {
                                onSelectedColorsChange(
                                    checked
                                        ? [...selectedColors, color]
                                        : selectedColors.filter(
                                              (c) => c !== color
                                          )
                                );
                            }}
                        />
                        {color}
                    </Label>
                ))}
            </div>
        </>
    );
});

const ColorFilter = memo(function ColorFilter({
    availableColors,
    selectedColors,
    onSelectedColorsChange,
    contentProps,
}: {
    availableColors: string[];
    selectedColors: string[];
    onSelectedColorsChange: (colors: string[]) => void;
    contentProps?: React.HTMLAttributes<HTMLDivElement>;
}) {
    return (
        <PopoverContent
            side="left"
            align="start"
            className="w-64 p-0"
            {...contentProps}
        >
            <div className="px-4 py-2.5">
                <p className="text-sm font-sans font-medium mb-2">Couleur</p>
                <ColorFilterContent
                    availableColors={availableColors}
                    selectedColors={selectedColors}
                    onSelectedColorsChange={onSelectedColorsChange}
                />
            </div>
        </PopoverContent>
    );
});

export const ExcludeSoldContent = memo(function ExcludeSoldContent({
    excludeSold,
    onExcludeSoldChange,
}: {
    excludeSold: boolean;
    onExcludeSoldChange: (value: boolean) => void;
}) {
    return (
        <Label className="flex items-center gap-2 text-sm font-sans">
            <Checkbox
                checked={excludeSold}
                onCheckedChange={(checked) =>
                    onExcludeSoldChange(checked === true)
                }
            />
            Exclure les vendus
        </Label>
    );
});

export const SearchFilters = memo(function SearchFilters({
    priceRange,
    priceActive,
    selectedColors,
    availableColors,
    excludeSold,
    onPriceRangeChange,
    onPriceActiveChange,
    onSelectedColorsChange,
    onExcludeSoldChange,
    onReset,
}: {
    priceRange: [number, number];
    priceActive: boolean;
    selectedColors: string[];
    availableColors: string[];
    excludeSold: boolean;
    onPriceRangeChange: (range: [number, number]) => void;
    onPriceActiveChange: (active: boolean) => void;
    onSelectedColorsChange: (colors: string[]) => void;
    onExcludeSoldChange: (value: boolean) => void;
    onReset: () => void;
}) {
    const [filtersOpen, setFiltersOpen] = useState(false);
    const filters = useFilterPopovers(["price", "color"]);

    const handleFiltersOpenChange = useCallback(
        (open: boolean) => {
            setFiltersOpen(open);
            if (!open) filters.reset();
        },
        [filters]
    );

    const hasActiveFilters =
        priceActive || selectedColors.length > 0 || excludeSold;

    return (
        <Popover open={filtersOpen} onOpenChange={handleFiltersOpenChange}>
            <PopoverTrigger asChild>
                <Button variant="outline" className="h-12 font-normal w-28">
                    <Filter className="size-4" />
                    Filtres
                    <ActiveDot
                        visible={hasActiveFilters}
                        className="ml-0.5 transition-opacity"
                    />
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-56 p-0">
                <div className="px-4 py-3 font-sans font-semibold text-sm border-b">
                    Filtres
                </div>

                <Popover
                    open={filters.price.open}
                    onOpenChange={filters.price.onOpenChange}
                >
                    <PopoverTrigger asChild>
                        <FilterMenuItem
                            label="Prix"
                            active={priceActive}
                            {...filters.price.triggerProps}
                        />
                    </PopoverTrigger>
                    <PriceFilter
                        priceRange={priceRange}
                        onPriceRangeChange={onPriceRangeChange}
                        onPriceActiveChange={onPriceActiveChange}
                        contentProps={filters.price.contentProps}
                    />
                </Popover>

                <Popover
                    open={filters.color.open}
                    onOpenChange={filters.color.onOpenChange}
                >
                    <PopoverTrigger asChild>
                        <FilterMenuItem
                            label="Couleur"
                            active={selectedColors.length > 0}
                            {...filters.color.triggerProps}
                        />
                    </PopoverTrigger>
                    <ColorFilter
                        availableColors={availableColors}
                        selectedColors={selectedColors}
                        onSelectedColorsChange={onSelectedColorsChange}
                        contentProps={filters.color.contentProps}
                    />
                </Popover>

                <div className="px-4 py-3 border-b">
                    <ExcludeSoldContent
                        excludeSold={excludeSold}
                        onExcludeSoldChange={onExcludeSoldChange}
                    />
                </div>

                <div className="px-4 py-3">
                    <Button
                        className="w-full"
                        size="sm"
                        variant={hasActiveFilters ? "default" : "outline"}
                        onClick={onReset}
                    >
                        Réinitialiser les filtres
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
});
