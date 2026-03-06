"use client";

import { useState, memo, useCallback } from "react";
import { useRouter } from "next/navigation";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useHotkey } from "@tanstack/react-hotkeys";
import { CornerDownLeft } from "lucide-react";
import { Kbd } from "@/components/ui/kbd";
import { Command, CommandInput } from "@/components/ui/command";
import {
    Dialog,
    DialogOverlay,
    DialogPortal,
    DialogTitle,
} from "@/components/ui/dialog";
import { trpc } from "@/trpc/client";
import { componentTypeIcons } from "@/components/create-post/component-selector";
import { cn } from "@/lib/utils";
import { ComponentType } from "@prisma/client";

interface SearchModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

type SearchComponent = { id: string; name: string; type: ComponentType };

function navigateToComponent(
    router: ReturnType<typeof useRouter>,
    component: SearchComponent
) {
    const params = new URLSearchParams({
        componentId: component.id,
        componentName: component.name,
        componentType: component.type,
    });
    router.push(`/search?${params.toString()}`);
}

const SearchInputBox = memo(
    ({
        value,
        onValueChange,
        hasResults,
    }: {
        value: string;
        onValueChange: (value: string) => void;
        hasResults: boolean;
    }) => {
        return (
            <Command
                className={`rounded-lg border bg-background shadow-lg mb-4 max-sm:mb-0 p-1.5 ${hasResults ? "max-sm:rounded-b-none" : ""}`}
                shouldFilter={false}
            >
                <CommandInput
                    placeholder="Rechercher du matos..."
                    wrapperClassName="border-0 pl-1.5 pr-0 text-sm text-foreground"
                    autoFocus
                    value={value}
                    onValueChange={onValueChange}
                    rightElement={
                        <div
                            className="flex max-sm:hidden cursor-text h-9 gap-2.5 max-w-50 items-center justify-between rounded-md bg-secondary px-2.5 text-sm text-muted-foreground clickable"
                            aria-hidden="true"
                        >
                            <Kbd className="border">
                                <CornerDownLeft className="!size-3.5" />
                            </Kbd>
                            Rechercher
                        </div>
                    }
                />
            </Command>
        );
    }
);
SearchInputBox.displayName = "SearchInputBox";

const SearchResults = memo(
    ({
        components,
        isLoading,
        searchValue,
        selectedIndex,
        onSelect,
    }: {
        components: SearchComponent[] | undefined;
        isLoading: boolean;
        searchValue: string;
        selectedIndex: number;
        onSelect: (component: SearchComponent) => void;
    }) => {
        if (!searchValue) return null;

        return (
            <div className="rounded-lg border bg-background shadow-lg overflow-hidden max-sm:rounded-t-none max-sm:border-t-0">
                <div className="bg-popover text-popover-foreground flex flex-col overflow-hidden">
                    <div className="max-h-75 max-sm:max-h-[calc(100svh-4rem)] scroll-py-1 overflow-x-hidden overflow-y-auto">
                        {(!components || components.length === 0) && (
                            <div className="py-6 text-center text-sm">
                                {isLoading
                                    ? "Recherche..."
                                    : "Aucun résultat trouvé."}
                            </div>
                        )}
                        {components && components.length > 0 && (
                            <div className="text-foreground overflow-hidden p-1">
                                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                                    Composants
                                </div>
                                {components.map((component, index) => {
                                    const Icon =
                                        componentTypeIcons[component.type];
                                    return (
                                        <div
                                            key={component.id}
                                            onClick={() => onSelect(component)}
                                            className={cn(
                                                "flex items-center gap-2 cursor-pointer select-none rounded-sm px-2 py-1.5 text-sm hover:bg-accent",
                                                index === selectedIndex &&
                                                    "bg-accent"
                                            )}
                                        >
                                            <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                                            <span className="truncate">
                                                {component.name}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
                <div className="p-3 text-xs border-t rounded-t-none">
                    <span>
                        Appuyez sur <b>Entrée</b> pour rechercher toutes les
                        annonces avec le terme{" "}
                        <b>&ldquo;{searchValue}&rdquo;</b> dans le nom
                    </span>
                </div>
            </div>
        );
    }
);
SearchResults.displayName = "SearchResults";

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
    const [searchValue, setSearchValue] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const router = useRouter();

    const { data: components, isLoading } = trpc.components.searchAll.useQuery(
        { query: searchValue, limit: 10 },
        { enabled: open && searchValue.length >= 1 }
    );

    const resultCount = components?.length ?? 0;

    const handleValueChange = useCallback((value: string) => {
        setSearchValue(value);
        setSelectedIndex(-1);
    }, []);

    const handleSelect = useCallback(
        (component: SearchComponent) => {
            navigateToComponent(router, component);
            onOpenChange(false);
        },
        [router, onOpenChange]
    );

    useHotkey(
        { key: "ArrowDown" },
        () => {
            if (resultCount <= 0) return;

            setSelectedIndex((prev) =>
                prev < resultCount - 1 ? prev + 1 : prev
            );
        },
        { enabled: open, ignoreInputs: false, preventDefault: true }
    );

    useHotkey(
        { key: "ArrowUp" },
        () => {
            if (resultCount <= 0) return;
            setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        },
        { enabled: open, ignoreInputs: false, preventDefault: true }
    );

    useHotkey(
        { key: "Enter" },
        () => {
            if (selectedIndex >= 0 && components?.[selectedIndex]) {
                handleSelect(components[selectedIndex]);
            } else if (searchValue.trim()) {
                router.push(
                    `/search?query=${encodeURIComponent(searchValue.trim())}`
                );
                onOpenChange(false);
            }
        },
        { enabled: open, ignoreInputs: false }
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogPortal>
                <DialogOverlay
                    className="bg-transparent backdrop-blur-sm transition-all duration-300"
                    onClick={() => onOpenChange(false)}
                />
                <DialogPrimitive.Content className="fixed top-[20%] left-[50%] -translate-x-1/2 z-50 w-full max-w-2xl outline-none sm:px-0 max-sm:top-0 max-sm:px-3 max-sm:pt-3 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 duration-200">
                    <DialogTitle className="sr-only">Recherche</DialogTitle>
                    <SearchInputBox
                        value={searchValue}
                        onValueChange={handleValueChange}
                        hasResults={!!searchValue}
                    />
                    <SearchResults
                        components={components}
                        isLoading={isLoading}
                        searchValue={searchValue}
                        selectedIndex={selectedIndex}
                        onSelect={handleSelect}
                    />
                </DialogPrimitive.Content>
            </DialogPortal>
        </Dialog>
    );
}
