"use client";

import { useEffect, useState, memo } from "react";
import { useRouter } from "next/navigation";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Dialog, DialogOverlay, DialogPortal } from "@/components/ui/dialog";
import { trpc } from "@/trpc/client";
import { PostCard, SelectedPost } from "@/components/post-card";

interface SearchModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const SearchInputBox = memo(
    ({
        value,
        onValueChange,
    }: {
        value: string;
        onValueChange: (value: string) => void;
    }) => {
        return (
            <Command
                className="rounded-lg border bg-background shadow-lg mb-4 py-3 px-1"
                shouldFilter={false}
            >
                <CommandInput
                    placeholder="Rechercher du matos..."
                    wrapperClassName="border-0"
                    autoFocus
                    value={value}
                    onValueChange={onValueChange}
                    rightElement={
                        <Button
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            <Kbd className="border text-xl">↵</Kbd>
                            Rechercher
                        </Button>
                    }
                />
            </Command>
        );
    }
);
SearchInputBox.displayName = "SearchInputBox";

const SearchResults = memo(
    ({
        searchValue,
        onSelect,
    }: {
        searchValue: string;
        onSelect: () => void;
    }) => {
        const router = useRouter();
        const { data: posts, isLoading } =
            trpc.configuration.searchPosts.useQuery(
                { query: searchValue, limit: 5 },
                { enabled: !!searchValue }
            );

        if (!searchValue) return null;

        return (
            <div className="rounded-lg border bg-background shadow-lg">
                <Command
                    className="border-none **:focus:outline-none"
                    shouldFilter={false}
                >
                    <CommandList>
                        <CommandEmpty className="py-6">
                            {isLoading
                                ? "Recherche..."
                                : "Aucun résultat trouvé."}
                        </CommandEmpty>
                        {posts && posts.length > 0 && (
                            <CommandGroup heading="Annonces">
                                {posts.map((post) => (
                                    <CommandItem
                                        key={post.id}
                                        onSelect={() => {
                                            router.push(`/post/${post.id}`);
                                            onSelect();
                                        }}
                                        className="p-1"
                                    >
                                        <PostCard post={post as SelectedPost} />
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}
                    </CommandList>
                </Command>
                <Command className="p-3 text-xs border-t rounded-t-none">
                    <span>
                        Appuyez sur <b>Entrée</b> pour rechercher toutes les
                        annonces avec le terme{" "}
                        <b>&ldquo;{searchValue}&rdquo;</b> dans le nom
                    </span>
                </Command>
            </div>
        );
    }
);
SearchResults.displayName = "SearchResults";

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
    const [searchValue, setSearchValue] = useState("");

    useEffect(() => {
        // Hack to maintain focus on input when results appear/disappear and when the dialog opens
        if (open) {
            const input = document.querySelector(
                '[data-slot="command-input"]'
            ) as HTMLInputElement;
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
                <DialogPrimitive.Content
                    style={{
                        opacity: open ? 1 : 0,
                        transition: "opacity 300ms ease-out",
                    }}
                    className="fixed top-[20%] left-[50%] -translate-x-1/2 z-50 w-full max-w-2xl outline-none"
                >
                    <SearchInputBox
                        value={searchValue}
                        onValueChange={setSearchValue}
                    />
                    <SearchResults
                        searchValue={searchValue}
                        onSelect={() => onOpenChange(false)}
                    />
                </DialogPrimitive.Content>
            </DialogPortal>
        </Dialog>
    );
}
