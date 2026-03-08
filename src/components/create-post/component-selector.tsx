"use client";

import { useState, useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";
import {
    Search,
    X,
    Loader2,
    ChevronRight,
    Package,
    Cpu,
    MonitorUp,
    CircuitBoard,
    MemoryStick,
    HardDrive,
    Database,
    Plug,
    Fan,
    Box,
    Wind,
    AudioLines,
    Wifi,
    type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ComponentType } from "@prisma/client";
import {
    getEnumDisplay,
    formatComponentData,
    ReturnedComponent,
    Components,
} from "@/utils/components";
import { trpc } from "@/trpc/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export const componentTypeIcons: Record<ComponentType, LucideIcon> = {
    CPU: Cpu,
    GPU: MonitorUp,
    MOTHERBOARD: CircuitBoard,
    RAM: MemoryStick,
    SSD: HardDrive,
    HDD: Database,
    POWER_SUPPLY: Plug,
    CPU_COOLER: Fan,
    CASE: Box,
    CASE_FAN: Wind,
    SOUND_CARD: AudioLines,
    WIRELESS_NETWORK_CARD: Wifi,
};

interface ComponentSelectorProps {
    selectedComponent?: ReturnedComponent;
    setSelectedComponent: (component?: ReturnedComponent) => void;
    disabled?: boolean;
    errored: boolean;
    hideHelperText?: boolean;
    className?: string;
    variant?: "default" | "inline";
}

export default function ComponentSelector({
    selectedComponent,
    setSelectedComponent,
    disabled,
    errored,
    hideHelperText,
    className,
    variant = "default",
}: ComponentSelectorProps) {
    const [open, setOpen] = useState(false);
    const [selectedType, setSelectedType] = useState<ComponentType | undefined>(
        undefined
    );
    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");

    const componentTypes = Object.values(ComponentType);

    const debouncedSetQuery = useDebouncedCallback((value: string) => {
        setDebouncedQuery(value);
    }, 300);

    // Reset state when dialog opens
    useEffect(() => {
        if (open) {
            setSelectedType(undefined);
            setQuery("");
            setDebouncedQuery("");
        }
    }, [open]);

    // Reset query when type changes
    useEffect(() => {
        setQuery("");
        setDebouncedQuery("");
    }, [selectedType]);

    // Fetch components
    const { data, isFetching } = trpc.components.getComponents.useQuery(
        {
            query: debouncedQuery,
            type: selectedType as ComponentType,
        },
        {
            enabled: !!selectedType && debouncedQuery.length >= 3,
        }
    );

    const handleSelectComponent = (component: ReturnedComponent) => {
        setSelectedComponent(component);
        setOpen(false);
    };

    const clearSelection = () => {
        setSelectedComponent(undefined);
    };

    const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        debouncedSetQuery(value);
    };

    const SelectedIcon = selectedComponent
        ? componentTypeIcons[selectedComponent.type]
        : null;

    return (
        <div className={cn("flex flex-col gap-2", className)}>
            {(variant === "inline" || (!selectedComponent && !errored)) && (
                <>
                    {/* Trigger Button */}
                    <Dialog open={open} onOpenChange={setOpen}>
                        <div className="relative">
                            <DialogTrigger asChild>
                                <Button
                                    disabled={disabled}
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start h-12 px-4 py-3 text-left font-normal [&>span]:w-full",
                                        !selectedComponent &&
                                            "text-muted-foreground",
                                        variant === "inline" &&
                                            selectedComponent &&
                                            "pr-9",
                                        errored &&
                                            "border-destructive ring-1 ring-destructive/50"
                                    )}
                                >
                                    {variant === "inline" &&
                                    selectedComponent &&
                                    SelectedIcon ? (
                                        <SelectedIcon className="h-5 w-5 shrink-0 text-muted-foreground" />
                                    ) : (
                                        <Package className="h-5 w-5 shrink-0 text-muted-foreground" />
                                    )}
                                    <span
                                        className={cn(
                                            "truncate flex-1",
                                            variant === "inline" &&
                                                selectedComponent
                                                ? "text-foreground"
                                                : "text-muted-foreground"
                                        )}
                                    >
                                        {variant === "inline" &&
                                        selectedComponent
                                            ? selectedComponent.name
                                            : "Sélectionner un composant..."}
                                    </span>
                                </Button>
                            </DialogTrigger>
                            {variant === "inline" && selectedComponent && (
                                <button
                                    type="button"
                                    disabled={disabled}
                                    onClick={clearSelection}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-muted transition-colors shrink-0 disabled:opacity-50 disabled:pointer-events-none"
                                    aria-label="Supprimer le composant"
                                >
                                    <X className="h-4 w-4 text-muted-foreground" />
                                </button>
                            )}
                        </div>

                        <DialogContent className="xs:max-w-lg p-0 gap-0">
                            <DialogHeader className="px-4 pt-4 pb-2">
                                <DialogTitle>
                                    {selectedType ? (
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 px-2 -ml-2"
                                                onClick={() =>
                                                    setSelectedType(undefined)
                                                }
                                            >
                                                <ChevronRight className="h-4 w-4 rotate-180" />
                                                Retour
                                            </Button>
                                            <span className="text-muted-foreground">
                                                |
                                            </span>
                                            {getEnumDisplay(selectedType)}
                                        </div>
                                    ) : (
                                        "Choisir un composant"
                                    )}
                                </DialogTitle>
                            </DialogHeader>

                            {/* Step 1: Select Category */}
                            {!selectedType ? (
                                <>
                                    <p className="text-sm text-muted-foreground px-4 pb-3">
                                        Sélectionnez le type de composant que
                                        vous vendez :
                                    </p>
                                    <ScrollArea className="max-h-[70vh]">
                                        <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 px-4 pb-4">
                                            {componentTypes.map((type) => {
                                                const Icon =
                                                    componentTypeIcons[type];
                                                return (
                                                    <Button
                                                        key={type}
                                                        variant="outline"
                                                        className="h-auto py-3 px-3 justify-start text-left gap-3"
                                                        onClick={() =>
                                                            setSelectedType(
                                                                type
                                                            )
                                                        }
                                                    >
                                                        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                                                        <span className="truncate flex-1">
                                                            {getEnumDisplay(
                                                                type
                                                            )}
                                                        </span>
                                                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                                                    </Button>
                                                );
                                            })}
                                        </div>
                                    </ScrollArea>
                                </>
                            ) : (
                                /* Step 2: Search Component */
                                <>
                                    <div className="px-4 pb-3">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder={`Rechercher un ${getEnumDisplay(selectedType).toLowerCase()}...`}
                                                value={query}
                                                onChange={handleQueryChange}
                                                className="pl-9 pr-9"
                                                autoFocus
                                            />
                                            {query && (
                                                <button
                                                    type="button"
                                                    onClick={() => setQuery("")}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2"
                                                >
                                                    <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <ScrollArea className="max-h-[70vh] border-t">
                                        <div className="p-2">
                                            {query.length < 3 ? (
                                                <div className="py-12 text-center text-sm text-muted-foreground">
                                                    <Search className="h-8 w-8 mx-auto mb-3 opacity-50" />
                                                    <p>
                                                        Tapez au moins 3
                                                        caractères pour
                                                        rechercher
                                                    </p>
                                                </div>
                                            ) : isFetching ? (
                                                <div className="py-12 text-center text-sm text-muted-foreground">
                                                    <Loader2 className="h-8 w-8 mx-auto mb-3 animate-spin" />
                                                    <p>Recherche en cours...</p>
                                                </div>
                                            ) : data && data.length === 0 ? (
                                                <div className="py-12 text-center text-sm text-muted-foreground">
                                                    <Package className="h-8 w-8 mx-auto mb-3 opacity-50" />
                                                    <p>
                                                        Aucun composant trouvé
                                                    </p>
                                                    <p className="text-xs mt-1">
                                                        Essayez avec
                                                        d&apos;autres termes
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="space-y-1">
                                                    {data?.map((component) => (
                                                        <button
                                                            key={component.id}
                                                            type="button"
                                                            onClick={() =>
                                                                handleSelectComponent(
                                                                    component as ReturnedComponent
                                                                )
                                                            }
                                                            className="w-full text-left p-3 rounded-md hover:bg-accent transition-colors"
                                                        >
                                                            <div className="flex items-start justify-between gap-2">
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="font-medium line-clamp-1">
                                                                        {
                                                                            component.name
                                                                        }
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                                        {formatComponentData(
                                                                            component.type,
                                                                            component.data as Components
                                                                        )
                                                                            .filter(
                                                                                Boolean
                                                                            )
                                                                            .slice(
                                                                                0,
                                                                                3
                                                                            )
                                                                            .join(
                                                                                " • "
                                                                            )}
                                                                    </p>
                                                                </div>
                                                                {component.price && (
                                                                    <Badge
                                                                        variant="secondary"
                                                                        className="shrink-0"
                                                                    >
                                                                        ~
                                                                        {component.price.toFixed(
                                                                            0
                                                                        )}
                                                                        €
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </ScrollArea>

                                    {data && data.length > 0 && (
                                        <div className="px-4 py-2 border-t text-xs text-muted-foreground">
                                            {data.length} résultat
                                            {data.length > 1 ? "s" : ""}
                                        </div>
                                    )}
                                </>
                            )}
                        </DialogContent>
                    </Dialog>
                </>
            )}
            {/* Selected component details (default variant only) */}
            {variant === "default" && selectedComponent && (
                <div className="p-3 rounded-md bg-muted/50 border">
                    <div className="flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-xs">
                                    {getEnumDisplay(selectedComponent.type)}
                                </Badge>
                            </div>
                            <p className="font-semibold">
                                {selectedComponent.name}
                            </p>
                            <div className="mt-2 text-sm text-muted-foreground space-y-0.5">
                                {formatComponentData(
                                    selectedComponent.type,
                                    selectedComponent.data as Components
                                )
                                    .filter(Boolean)
                                    .slice(0, 4)
                                    .map((line, i) => (
                                        <p key={i}>{line}</p>
                                    ))}
                            </div>
                        </div>
                        <button
                            type="button"
                            disabled={disabled}
                            onClick={clearSelection}
                            className="p-1.5 rounded-md hover:bg-muted transition-colors shrink-0 disabled:opacity-50"
                            aria-label="Supprimer le composant"
                        >
                            <X className="h-4 w-4 text-muted-foreground" />
                        </button>
                    </div>
                </div>
            )}

            {!selectedComponent && !hideHelperText && variant === "default" && (
                <p className="text-[0.8rem] text-muted-foreground">
                    Recherchez votre composant dans notre base de données.
                </p>
            )}
        </div>
    );
}
