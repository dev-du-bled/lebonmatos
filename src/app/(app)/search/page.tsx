"use client";

import { useState, useEffect, useCallback } from "react";
import { Search } from "lucide-react";
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
import { SearchFilters, type ComponentColor } from "@/components/search/search-filters";
import { SearchResultsList } from "@/components/search/search-results-list";
import {
    SearchPaginationCompact,
    SearchPaginationFull,
} from "@/components/search/search-pagination";

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

export default function SearchPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const urlQuery = searchParams.get("query") ?? "";
    const urlComponentId = searchParams.get("componentId");
    const urlComponentName = searchParams.get("componentName");
    const urlComponentType = searchParams.get(
        "componentType"
    ) as ComponentType | null;

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

    const [priceRange, setPriceRange] = useState<[number, number]>([
        0,
        PRICE_MAX_DEFAULT,
    ]);
    const [debouncedPriceRange, setDebouncedPriceRange] = useState<
        [number, number]
    >([0, PRICE_MAX_DEFAULT]);
    const [priceActive, setPriceActive] = useState(false);
    const [selectedColors, setSelectedColors] = useState<ComponentColor[]>([]);

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

    const handleSelectedColorsChange = useCallback((colors: ComponentColor[]) => {
        setSelectedColors(colors);
        setPage(0);
    }, []);

    const handleResetFilters = useCallback(() => {
        setPriceRange([0, PRICE_MAX_DEFAULT]);
        setDebouncedPriceRange([0, PRICE_MAX_DEFAULT]);
        setPriceActive(false);
        setSelectedColors([]);
        setPage(0);
    }, []);

    return (
        <div className="wide-lock flex flex-col gap-3 mb-12.5!">
            <span className="text-xl sm:text-2xl font-bold font-sans text-foreground">
                Trouvez votre futur Matos
            </span>

            <div className="flex flex-row gap-2.5 w-full">
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
                    onPriceRangeChange={handlePriceRangeChange}
                    onPriceActiveChange={setPriceActive}
                    onSelectedColorsChange={handleSelectedColorsChange}
                    onReset={handleResetFilters}
                />
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
                <div className="flex items-center justify-between">
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
