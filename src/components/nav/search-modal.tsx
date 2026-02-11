"use client";

import { useState, memo } from "react";
import { useRouter } from "next/navigation";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { Command, CommandInput } from "@/components/ui/command";
import {
    Dialog,
    DialogOverlay,
    DialogPortal,
    DialogTitle,
} from "@/components/ui/dialog";
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
                <div className="bg-popover text-popover-foreground flex flex-col overflow-hidden rounded-md border-none">
                    <div className="max-h-75 scroll-py-1 overflow-x-hidden overflow-y-auto">
                        {(!posts || posts.length === 0) && (
                            <div className="py-6 text-center text-sm">
                                {isLoading
                                    ? "Recherche..."
                                    : "Aucun résultat trouvé."}
                            </div>
                        )}
                        {posts && posts.length > 0 && (
                            <div className="text-foreground overflow-hidden p-1">
                                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                                    Annonces
                                </div>
                                {posts.map((post) => (
                                    <div
                                        key={post.id}
                                        onClick={() => {
                                            router.push(`/post/${post.id}`);
                                            onSelect();
                                        }}
                                        className="cursor-pointer select-none p-1"
                                    >
                                        <PostCard post={post as SelectedPost} />
                                    </div>
                                ))}
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
                    <DialogTitle className="sr-only">Recherche</DialogTitle>
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
