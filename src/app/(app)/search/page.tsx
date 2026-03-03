"use client";

import { useState, useEffect } from "react";
import { Filter, ChevronRight, Circle, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import ComponentSelector from "@/components/create-post/component-selector";
import { type ReturnedComponent, getEnumDisplay } from "@/utils/components";
import { ComponentType } from "@prisma/client";
import LocationSelector from "@/components/create-post/location-selector";
import FavoriteButton from "@/app/(app)/post/[id]/favorite-button";
import { type CityData } from "@/utils/location";
import { trpc } from "@/trpc/client";
import { useDebouncedCallback } from "use-debounce";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

export default function SearchPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const urlQuery = searchParams.get("query") ?? "";
    const urlComponentId = searchParams.get("componentId");
    const urlComponentName = searchParams.get("componentName");
    const urlComponentType = searchParams.get("componentType") as ComponentType | null;

    const initialComponent = urlComponentId && urlComponentName && urlComponentType
        ? { id: urlComponentId, name: urlComponentName, type: urlComponentType, price: null, color: null, data: {} }
        : undefined;

    const [query, setQuery] = useState(urlQuery);
    const [debouncedQuery, setDebouncedQuery] = useState(urlQuery);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [priceOpen, setPriceOpen] = useState(false);
    const [selectedComponent, setSelectedComponent] = useState<ReturnedComponent | undefined>(initialComponent);
    const [selectedLocation, setSelectedLocation] = useState<CityData | undefined>(undefined);
    const [page, setPage] = useState(0);
    const limit = 20;

    useEffect(() => {
        setQuery(urlQuery);
        setDebouncedQuery(urlQuery);
        setPage(0);
        if (urlComponentId && urlComponentName && urlComponentType) {
            setSelectedComponent({ id: urlComponentId, name: urlComponentName, type: urlComponentType, price: null, color: null, data: {} });
        }
    }, [urlQuery, urlComponentId, urlComponentName, urlComponentType]);

    const debounce = useDebouncedCallback((value: string) => {
        setDebouncedQuery(value);
        router.replace(`/search?query=${encodeURIComponent(value)}`, { scroll: false });
        setPage(0);
    }, 350);

    const { data, isLoading } = trpc.posts.search.useQuery({
        query: debouncedQuery || undefined,
        componentId: selectedComponent?.id,
        location: selectedLocation ? { lat: selectedLocation.lat, lon: selectedLocation.lon } : undefined,
        limit,
        offset: page * limit,
    });

    const results = data?.hits ?? [];
    const totalHits = data?.totalHits ?? 0;
    const totalPages = Math.ceil(totalHits / limit);

    return (
        <div className="wide-lock flex flex-col gap-3 mb-12.5!">
            <span className="text-xl sm:text-2xl font-bold font-sans text-foreground">Trouvez votre future Matos</span>

            <div className="flex flex-row gap-2.5 w-full">
                <InputGroup className="w-full h-12">
                    <InputGroupAddon align="inline-start">
                        <Search className="size-4" />
                    </InputGroupAddon>
                    <InputGroupInput
                        placeholder="céléron"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            debounce(e.target.value);
                        }}
                    />
                </InputGroup>

                <ComponentSelector
                    selectedComponent={selectedComponent}
                    setSelectedComponent={(c) => { setSelectedComponent(c); setPage(0); }}
                    errored={false}
                    hideHelperText
                    variant="inline"
                    className="min-w-md"
                />

                <LocationSelector className="max-w-xs h-12" defaultValue={selectedLocation} onChange={(l) => { setSelectedLocation(l); setPage(0); }} />

                <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="h-12 font-normal">
                            <Filter className="size-4" />
                            Filtres
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-56 p-0">
                        <div className="px-4 py-3 font-sans font-semibold text-sm border-b">Filtres</div>

                        <Popover open={priceOpen} onOpenChange={setPriceOpen}>
                            <PopoverTrigger asChild>
                                <button className="w-full flex items-center justify-between px-4 py-3 text-sm font-sans hover:bg-accent transition-colors">
                                    <span>Prix</span>
                                    <span className="flex items-center gap-1.5">
                                        <Circle className="size-2 fill-primary text-primary" />
                                        <ChevronRight className="size-4 text-muted-foreground" />
                                    </span>
                                </button>
                            </PopoverTrigger>
                            <PopoverContent side="left" align="start" className="w-56">
                                <p className="text-sm font-sans font-medium mb-3">Prix</p>
                                <Slider defaultValue={[0, 70]} min={0} max={100} />
                            </PopoverContent>
                        </Popover>

                        <button className="w-full flex items-center justify-between px-4 py-3 text-sm font-sans hover:bg-accent transition-colors">
                            <span>Marque</span>
                            <ChevronRight className="size-4 text-muted-foreground" />
                        </button>

                        <button className="w-full flex items-center justify-between px-4 py-3 text-sm font-sans hover:bg-accent transition-colors border-b">
                            <span>Etat</span>
                            <ChevronRight className="size-4 text-muted-foreground" />
                        </button>

                        <div className="px-4 py-3">
                            <Button className="w-full" size="sm">
                                Reinitialiser les filtres
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            {!isLoading && (
                <div className="flex items-center justify-between">
                    <p className="font-sans text-sm text-muted-foreground">
                        {debouncedQuery && <>Résultats pour &quot;{debouncedQuery}&quot; - </>}
                        {totalHits} résultat{totalHits !== 1 ? "s" : ""}
                    </p>
                    {totalPages > 1 && (
                        <Pagination className="w-auto mx-0">
                            <PaginationContent className="gap-0">
                                {Array.from({ length: totalPages }, (_, i) => {
                                    if (i === 0 || i === totalPages - 1 || Math.abs(i - page) <= 1) {
                                        return (
                                            <PaginationItem key={i}>
                                                <PaginationLink isActive={i === page} onClick={(e) => { e.preventDefault(); setPage(i); }} className={cn("cursor-pointer size-6 text-xs", i === page && "font-semibold text-foreground border-none shadow-none")}>
                                                    {i + 1}
                                                </PaginationLink>
                                            </PaginationItem>
                                        );
                                    }
                                    if (Math.abs(i - page) === 2) {
                                        return <PaginationItem key={i}><PaginationEllipsis className="size-6" /></PaginationItem>;
                                    }
                                    return null;
                                })}
                            </PaginationContent>
                        </Pagination>
                    )}
                </div>
            )}

            <div className="flex flex-col">
                {results.map((post) => (
                    <Link key={post.id} href={`/post/${post.id}`} className="flex items-center gap-4 border rounded-lg overflow-hidden my-1.5 hover:bg-muted/50 transition-colors">
                        <div className="w-44 h-32 shrink-0 bg-muted">
                            <Image
                                src={post.images[0] || "/images/fallback.webp"}
                                alt={post.title}
                                width={176}
                                height={128}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex-1 min-w-0 py-3">
                            <p className="font-sans font-semibold text-base">{post.title}</p>
                            <p className="font-sans font-semibold text-base">{post.price} €</p>
                            <p className="font-sans text-sm text-muted-foreground mt-2">{getEnumDisplay(post.componentType)}</p>
                            {post.locationCity && <p className="font-sans text-sm text-muted-foreground">{post.locationCity}</p>}
                        </div>
                        <div onClick={(e) => e.preventDefault()}>
                            <FavoriteButton post={{ id: post.id, seller: { id: post.userId } }} className="mr-3" />
                        </div>
                    </Link>
                ))}
            </div>

            {!isLoading && results.length > 0 && (
                <div className="flex items-center justify-between">
                    <p className="font-sans text-sm text-muted-foreground">
                        {totalHits} résultat{totalHits !== 1 ? "s" : ""}
                    </p>
                    {totalPages > 1 && (
                        <Pagination className="w-auto mx-0">
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious onClick={(e) => { e.preventDefault(); setPage((p) => p - 1); }} aria-disabled={page === 0} className={page === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                                </PaginationItem>
                                {Array.from({ length: totalPages }, (_, i) => {
                                    if (i === 0 || i === totalPages - 1 || Math.abs(i - page) <= 1) {
                                        return (
                                            <PaginationItem key={i}>
                                                <PaginationLink isActive={i === page} onClick={(e) => { e.preventDefault(); setPage(i); }} className="cursor-pointer">
                                                    {i + 1}
                                                </PaginationLink>
                                            </PaginationItem>
                                        );
                                    }
                                    if (Math.abs(i - page) === 2) {
                                        return <PaginationItem key={i}><PaginationEllipsis /></PaginationItem>;
                                    }
                                    return null;
                                })}
                                <PaginationItem>
                                    <PaginationNext onClick={(e) => { e.preventDefault(); setPage((p) => p + 1); }} aria-disabled={page >= totalPages - 1} className={page >= totalPages - 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    )}
                </div>
            )}
        </div>
    );
}
