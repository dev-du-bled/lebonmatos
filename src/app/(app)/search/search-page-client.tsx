"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group";
import ComponentSelector from "@/components/create-post/component-selector";
import { type ReturnedComponent } from "@/utils/components";
import { ComponentType } from "@prisma/client";
import LocationSelector from "@/components/create-post/location-selector";
import { type CityData } from "@/utils/location";
import { trpc } from "@/trpc/client";
import { useDebouncedCallback } from "use-debounce";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
    SearchFilters,
    PriceFilterContent,
    ColorFilterContent,
    ExcludeSoldContent,
} from "@/components/search/search-filters";
import { SearchResultsList } from "@/components/search/search-results-list";
import {
    SearchPaginationCompact,
    SearchPaginationFull,
} from "@/components/search/search-pagination";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
    DrawerFooter,
    DrawerClose,
} from "@/components/ui/drawer";

const PRICE_MAX_DEFAULT = 2000;

function ResultsCount({
    totalHits,
    query,
}: {
    totalHits: number;
    query?: string;
}) {
    return (
        <p className="font-sans text-sm text-muted-foreground">
            {query && <>Résultats pour &quot;{query}&quot; - </>}
            {totalHits} résultat{totalHits !== 1 ? "s" : ""}
        </p>
    );
}

export default function SearchPageClient({
    initialQuery,
    initialComponentId,
    initialComponentName,
    initialComponentType,
}: {
    initialQuery: string;
    initialComponentId?: string;
    initialComponentName?: string;
    initialComponentType?: ComponentType;
}) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const urlQuery = searchParams.get("query") ?? initialQuery;
    const urlComponentId =
        searchParams.get("componentId") ?? initialComponentId;
    const urlComponentName =
        searchParams.get("componentName") ?? initialComponentName;
    const urlComponentType = (searchParams.get("componentType") ??
        initialComponentType) as ComponentType | null;

    const initialComponent =
        urlComponentId && urlComponentName && urlComponentType
            ? {
                  id: urlComponentId,
                  name: urlComponentName,
                  type: urlComponentType,
                  price: null,
                  color: null,
                  data: {},
              }
            : undefined;

    const [query, setQuery] = useState(urlQuery);
    const [debouncedQuery, setDebouncedQuery] = useState(urlQuery);
    const [selectedComponent, setSelectedComponent] = useState<
        ReturnedComponent | undefined
    >(initialComponent);
    const [selectedLocation, setSelectedLocation] = useState<
        CityData | undefined
    >(undefined);
    const [page, setPage] = useState(0);
    const limit = 20;

    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const [priceRange, setPriceRange] = useState<[number, number]>([
        0,
        PRICE_MAX_DEFAULT,
    ]);
    const [debouncedPriceRange, setDebouncedPriceRange] = useState<
        [number, number]
    >([0, PRICE_MAX_DEFAULT]);
    const [priceActive, setPriceActive] = useState(false);
    const [selectedColors, setSelectedColors] = useState<string[]>([]);
    const [excludeSold, setExcludeSold] = useState(false);

    const { data: availableColors } = trpc.posts.availableColors.useQuery();

    useEffect(() => {
        setQuery(urlQuery);
        setDebouncedQuery(urlQuery);
        setPage(0);
        if (urlComponentId && urlComponentName && urlComponentType) {
            setSelectedComponent({
                id: urlComponentId,
                name: urlComponentName,
                type: urlComponentType,
                price: null,
                color: null,
                data: {},
            });
        }
    }, [urlQuery, urlComponentId, urlComponentName, urlComponentType]);

    const debounce = useDebouncedCallback((value: string) => {
        setDebouncedQuery(value);
        router.replace(`/search?query=${encodeURIComponent(value)}`, {
            scroll: false,
        });
        setPage(0);
    }, 350);

    const debouncePrice = useDebouncedCallback((value: [number, number]) => {
        setDebouncedPriceRange(value);
        setPage(0);
    }, 400);

    const { data, isLoading } = trpc.posts.search.useQuery({
        query: debouncedQuery || undefined,
        componentId: selectedComponent?.id,
        location: selectedLocation
            ? { lat: selectedLocation.lat, lon: selectedLocation.lon }
            : undefined,
        priceMin: priceActive ? debouncedPriceRange[0] : undefined,
        priceMax: priceActive ? debouncedPriceRange[1] : undefined,
        colors: selectedColors.length > 0 ? selectedColors : undefined,
        excludeSold: excludeSold || undefined,
        limit,
        offset: page * limit,
    });

    const results = data?.hits ?? [];
    const totalHits = data?.totalHits ?? 0;
    const totalPages = Math.ceil(totalHits / limit);

    const handlePriceRangeChange = useCallback(
        (range: [number, number]) => {
            setPriceRange(range);
            debouncePrice(range);
        },
        [debouncePrice]
    );

    const handleSelectedColorsChange = useCallback(
        (colors: string[]) => {
            setSelectedColors(colors);
            setPage(0);
        },
        []
    );

    const handleExcludeSoldChange = useCallback((value: boolean) => {
        setExcludeSold(value);
        setPage(0);
    }, []);

    const handleResetFilters = useCallback(() => {
        setPriceRange([0, PRICE_MAX_DEFAULT]);
        setDebouncedPriceRange([0, PRICE_MAX_DEFAULT]);
        setPriceActive(false);
        setSelectedColors([]);
        setExcludeSold(false);
        setPage(0);
    }, []);

    const hasActiveFilters = priceActive || selectedColors.length > 0 || excludeSold;

    return (
        <div className="wide-lock flex flex-col gap-3 mb-12.5!">
            <span className="text-xl sm:text-2xl font-bold font-sans text-foreground py-2">
                Trouvez votre futur Matos
            </span>

            {/* Barre de recherche desktop */}
            <div className="hidden lg:flex flex-row gap-2.5 w-full">
                <InputGroup className="w-full h-12">
                    <InputGroupAddon align="inline-start">
                        <Search className="size-4" />
                    </InputGroupAddon>
                    <InputGroupInput
                        placeholder="ex: céléron..."
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            debounce(e.target.value);
                        }}
                    />
                </InputGroup>

                <ComponentSelector
                    selectedComponent={selectedComponent}
                    setSelectedComponent={(c) => {
                        setSelectedComponent(c);
                        setPage(0);
                    }}
                    errored={false}
                    hideHelperText
                    variant="inline"
                    className="min-w-md"
                />

                <LocationSelector
                    className="max-w-xs h-12"
                    defaultValue={selectedLocation}
                    onChange={(l) => {
                        setSelectedLocation(l);
                        setPage(0);
                    }}
                />

                <SearchFilters
                    priceRange={priceRange}
                    priceActive={priceActive}
                    selectedColors={selectedColors}
                    availableColors={availableColors ?? []}
                    excludeSold={excludeSold}
                    onPriceRangeChange={handlePriceRangeChange}
                    onPriceActiveChange={setPriceActive}
                    onSelectedColorsChange={handleSelectedColorsChange}
                    onExcludeSoldChange={handleExcludeSoldChange}
                    onReset={handleResetFilters}
                />
            </div>

            {/* Barre de recherche mobile */}
            <div className="flex lg:hidden flex-row gap-2 w-full">
                <InputGroup className="w-full h-12">
                    <InputGroupAddon align="inline-start">
                        <Search className="size-4" />
                    </InputGroupAddon>
                    <InputGroupInput
                        placeholder="ex: céléron..."
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            debounce(e.target.value);
                        }}
                    />
                </InputGroup>

                <Drawer
                    open={mobileFiltersOpen}
                    onOpenChange={setMobileFiltersOpen}
                    direction="bottom"
                >
                    <DrawerTrigger asChild>
                        <Button
                            variant="outline"
                            className="h-12 shrink-0 relative"
                        >
                            <SlidersHorizontal className="size-4" />
                            Filtres
                            {(hasActiveFilters ||
                                selectedComponent ||
                                selectedLocation) && (
                                <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary" />
                            )}
                        </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                        <DrawerHeader>
                            <DrawerTitle>Filtres</DrawerTitle>
                        </DrawerHeader>
                        <div className="flex flex-col gap-5 px-4 overflow-y-auto">
                            <div className="flex flex-col gap-1.5">
                                <span className="text-sm font-medium font-sans">
                                    Composant
                                </span>
                                <ComponentSelector
                                    selectedComponent={selectedComponent}
                                    setSelectedComponent={(c) => {
                                        setSelectedComponent(c);
                                        setPage(0);
                                    }}
                                    errored={false}
                                    hideHelperText
                                    variant="inline"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <span className="text-sm font-medium font-sans">
                                    Localisation
                                </span>
                                <LocationSelector
                                    defaultValue={selectedLocation}
                                    onChange={(l) => {
                                        setSelectedLocation(l);
                                        setPage(0);
                                    }}
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <span className="text-sm font-medium font-sans">
                                    Prix
                                </span>
                                <PriceFilterContent
                                    priceRange={priceRange}
                                    onPriceRangeChange={handlePriceRangeChange}
                                    onPriceActiveChange={setPriceActive}
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <span className="text-sm font-medium font-sans">
                                    Couleur
                                </span>
                                <ColorFilterContent
                                    availableColors={availableColors ?? []}
                                    selectedColors={selectedColors}
                                    onSelectedColorsChange={
                                        handleSelectedColorsChange
                                    }
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <ExcludeSoldContent
                                    excludeSold={excludeSold}
                                    onExcludeSoldChange={handleExcludeSoldChange}
                                />
                            </div>
                        </div>
                        <DrawerFooter>
                            <Button
                                variant={
                                    hasActiveFilters ? "default" : "outline"
                                }
                                size="sm"
                                onClick={handleResetFilters}
                            >
                                Réinitialiser les filtres
                            </Button>
                            <DrawerClose asChild>
                                <Button variant="outline" size="sm">
                                    Fermer
                                </Button>
                            </DrawerClose>
                        </DrawerFooter>
                    </DrawerContent>
                </Drawer>
            </div>

            <div className="flex items-center justify-between">
                {isLoading ? (
                    <Skeleton className="h-4 w-24" />
                ) : (
                    <ResultsCount
                        totalHits={totalHits}
                        query={debouncedQuery || undefined}
                    />
                )}
                {!isLoading && (
                    <SearchPaginationCompact
                        page={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                    />
                )}
            </div>

            <SearchResultsList results={results} isLoading={isLoading} />

            {!isLoading && results.length > 0 && (
                <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
                    <ResultsCount totalHits={totalHits} />
                    <SearchPaginationFull
                        page={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                    />
                </div>
            )}
        </div>
    );
}
