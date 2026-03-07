"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { DynamicLogo } from "../dynamic-logo";
import { Plus, SearchIcon } from "lucide-react";
import { Button } from "../ui/button";
import { UserMenu } from "./user-menu";
import { Kbd } from "@/components/ui/kbd";
import Link from "next/link";
import { SearchModal } from "./search-modal";
import { useHotkey, formatForDisplay } from "@tanstack/react-hotkeys";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "../ui/tooltip";

export default function Header({ className }: { className?: string }) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const headerRef = useRef<HTMLElement>(null);

    useHotkey("Mod+K", () => {
        setSearchOpen((open) => !open);
    });

    useEffect(() => {
        const update = () => {
            const h = headerRef.current?.offsetHeight ?? 0;
            document.documentElement.style.setProperty(
                "--header-height",
                `${h}px`
            );
        };
        update();
        const observer = new ResizeObserver(update);
        if (headerRef.current) observer.observe(headerRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };

        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <>
            <header
                ref={headerRef}
                className={cn(
                    "sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 box-border p-4 md:p-5",
                    isScrolled && "border-b",
                    className
                )}
            >
                <div className="flex items-center justify-between md:wide-lock-wider">
                    <Link href={"/"}>
                        <DynamicLogo
                            width={120}
                            className="shrink-0 md:hidden"
                        />
                        <DynamicLogo
                            width={175}
                            className="shrink-0 hidden md:block"
                        />
                    </Link>

                    {/* Mobile */}
                    <div className="flex items-center gap-1 md:hidden">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Link href="/create-post">
                                        <Button
                                            size="icon"
                                            aria-label="Publier"
                                        >
                                            <Plus className="size-4 shrink-0" />
                                        </Button>
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent>Publier</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        aria-label="Rechercher"
                                        onClick={() => setSearchOpen(true)}
                                    >
                                        <SearchIcon className="size-4 shrink-0 opacity-50" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Rechercher</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <UserMenu />
                    </div>

                    {/* Desktop */}
                    <div className="hidden md:flex items-center gap-2 w-full justify-end">
                        <Link href="/create-post">
                            <Button className="hover:cursor-pointer">
                                Publier
                            </Button>
                        </Link>
                        <button
                            onClick={() => setSearchOpen(true)}
                            className="flex cursor-text h-9 w-full max-w-50 items-center justify-between rounded-md bg-secondary px-3 text-sm text-muted-foreground"
                        >
                            <div className="flex items-center gap-2">
                                <SearchIcon className="size-4 shrink-0 opacity-50" />
                                <span>Rechercher</span>
                            </div>
                            <Kbd className="border">
                                {formatForDisplay("Mod+K")}
                            </Kbd>
                        </button>
                        <UserMenu />
                    </div>
                </div>
            </header>

            <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
        </>
    );
}
