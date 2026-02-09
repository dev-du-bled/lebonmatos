"use client";

import { useEffect, useState, memo } from "react";
import { SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogOverlay, DialogPortal } from "@/components/ui/dialog";

interface SearchModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const SearchInputBox = memo(({ value, onValueChange }: { value: string; onValueChange: (value: string) => void }) => {
    return (
        <Command className="rounded-lg border bg-background shadow-lg mb-4 py-3 px-1">
            <CommandInput
                placeholder="Rechercher du matos..."
                wrapperClassName="border-0"
                autoFocus
                value={value}
                onValueChange={onValueChange}
                rightElement={
                    <Button variant="outline" className="flex items-center gap-2">
                        <Kbd className="border text-xl">↵</Kbd>
                        Rechercher
                    </Button>
                }
            />
        </Command>
    );
});
SearchInputBox.displayName = "SearchInputBox";

const SearchResults = memo(({ searchValue }: { searchValue: string }) => {
    if (!searchValue) return null;

    return (
        <div className="rounded-lg border bg-background shadow-lg" onFocus={(e) => e.preventDefault()}>
            <Command className="border-none **:focus:outline-none">
                <CommandList>
                    <CommandEmpty className="py-6">Aucun résultat trouvé.</CommandEmpty>
                    <CommandGroup heading="Suggestions">
                        <CommandItem>
                            <SearchIcon className="mr-2 h-4 w-4" />
                            <span>Rechercher des annonces</span>
                        </CommandItem>
                        <CommandItem>
                            <SearchIcon className="mr-2 h-4 w-4" />
                            <span>Rechercher des utilisateurs</span>
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </Command>
            <Command className="p-3 text-xs border-t rounded-t-none">
                <span>
                    Appuyez sur <b>Entrée</b> pour rechercher toutes les annonces avec le terme{" "}
                    <b>&ldquo;{searchValue}&rdquo;</b> dans le nom
                </span>
            </Command>
        </div>
    );
});
SearchResults.displayName = "SearchResults";

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
    const [searchValue, setSearchValue] = useState("");

    useEffect(() => {
        // Hack to maintain focus on input when results appear/disappear and when the dialog opens
        if (open) {
            const input = document.querySelector('[data-slot="command-input"]') as HTMLInputElement;
            if (input && document.activeElement !== input) {
                input.focus();
            }
        }
    }, [searchValue, open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogPortal>
                <DialogOverlay
                    className="bg-transparent backdrop-blur-sm transition-all duration-300"
                    onClick={() => onOpenChange(false)}
                />
                <div
                    style={{
                        opacity: open ? 1 : 0,
                        transition: "opacity 300ms ease-out",
                    }}
                    className="fixed top-[20%] left-[50%] -translate-x-1/2 z-50 w-full max-w-2xl"
                >
                    <SearchInputBox value={searchValue} onValueChange={setSearchValue} />
                    <SearchResults searchValue={searchValue} />
                </div>
            </DialogPortal>
        </Dialog>
    );
}
