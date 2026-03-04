"use client";

import { memo, useState, forwardRef } from "react";
import { Filter, ChevronRight, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// not sure if it is worth it, but maybe fetching the available options for color as well as the minimum/max price
// from the database/meili would be nice ? For now it's going to stay hardcoded -Lyna
const PRICE_MAX_DEFAULT = 2000;
const COLORS = ["Black", "White", "Gray", "Silver"];

function ActiveDot({ visible, className }: { visible: boolean; className?: string }) {
    return <Circle className={cn("size-2 fill-primary text-primary", visible ? "opacity-100" : "opacity-0", className)} />;
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
                onChange={(e) => onChange(Number(e.target.value))}
                className="h-7 w-20 text-xs px-2"
            />
            <span className="text-xs text-muted-foreground">€</span>
        </div>
    );
}

const PriceFilter = memo(function PriceFilter({
    priceRange,
    onPriceRangeChange,
    onPriceActiveChange,
}: {
    priceRange: [number, number];
    onPriceRangeChange: (range: [number, number]) => void;
    onPriceActiveChange: (active: boolean) => void;
}) {
    return (
        <PopoverContent side="left" align="start" className="w-64">
            <p className="text-sm font-sans font-medium mb-4">Prix</p>
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
                        const clamped = Math.max(0, Math.min(val, priceRange[1]));
                        onPriceRangeChange([clamped, priceRange[1]]);
                        onPriceActiveChange(true);
                    }}
                />
                <PriceRangeInput
                    value={priceRange[1]}
                    min={priceRange[0]}
                    max={PRICE_MAX_DEFAULT}
                    onChange={(val) => {
                        const clamped = Math.min(PRICE_MAX_DEFAULT, Math.max(val, priceRange[0]));
                        onPriceRangeChange([priceRange[0], clamped]);
                        onPriceActiveChange(true);
                    }}
                />
            </div>
        </PopoverContent>
    );
});

const ColorFilter = memo(function ColorFilter({
    selectedColors,
    onSelectedColorsChange,
}: {
    selectedColors: string[];
    onSelectedColorsChange: (colors: string[]) => void;
}) {
    return (
        <PopoverContent side="left" align="start" className="w-48 p-0">
            <button
                className="w-full text-left px-4 py-2.5 text-xs font-sans text-muted-foreground hover:text-foreground hover:bg-accent transition-colors border-b"
                onClick={() => onSelectedColorsChange([])}
            >
                Tout désélectionner
            </button>
            {COLORS.map((color) => (
                <label
                    key={color}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-sans hover:bg-accent transition-colors cursor-pointer"
                >
                    <input
                        type="checkbox"
                        checked={selectedColors.includes(color)}
                        onChange={(e) => {
                            onSelectedColorsChange(
                                e.target.checked ? [...selectedColors, color] : selectedColors.filter((c) => c !== color)
                            );
                        }}
                        className="accent-primary size-3.5"
                    />
                    {color}
                </label>
            ))}
        </PopoverContent>
    );
});

export const SearchFilters = memo(function SearchFilters({
    priceRange,
    priceActive,
    selectedColors,
    onPriceRangeChange,
    onPriceActiveChange,
    onSelectedColorsChange,
    onReset,
}: {
    priceRange: [number, number];
    priceActive: boolean;
    selectedColors: string[];
    onPriceRangeChange: (range: [number, number]) => void;
    onPriceActiveChange: (active: boolean) => void;
    onSelectedColorsChange: (colors: string[]) => void;
    onReset: () => void;
}) {
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [priceOpen, setPriceOpen] = useState(false);
    const [colorOpen, setColorOpen] = useState(false);

    const hasActiveFilters = priceActive || selectedColors.length > 0;

    return (
        <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" className="h-12 font-normal w-28">
                    <Filter className="size-4" />
                    Filtres
                    <ActiveDot visible={hasActiveFilters} className="ml-0.5 transition-opacity" />
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-56 p-0">
                <div className="px-4 py-3 font-sans font-semibold text-sm border-b">Filtres</div>

                <Popover open={priceOpen} onOpenChange={setPriceOpen}>
                    <PopoverTrigger asChild>
                        <FilterMenuItem label="Prix" active={priceActive} />
                    </PopoverTrigger>
                    <PriceFilter
                        priceRange={priceRange}
                        onPriceRangeChange={onPriceRangeChange}
                        onPriceActiveChange={onPriceActiveChange}
                    />
                </Popover>

                <Popover open={colorOpen} onOpenChange={setColorOpen}>
                    <PopoverTrigger asChild>
                        <FilterMenuItem label="Couleur" active={selectedColors.length > 0} className="border-b" />
                    </PopoverTrigger>
                    <ColorFilter selectedColors={selectedColors} onSelectedColorsChange={onSelectedColorsChange} />
                </Popover>

                <div className="px-4 py-3">
                    <Button className="w-full" size="sm" variant={hasActiveFilters ? "default" : "outline"} onClick={onReset}>
                        Réinitialiser les filtres
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
});
