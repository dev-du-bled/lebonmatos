"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { DynamicLogo } from "../dynamic-logo";
import { SearchIcon } from "lucide-react";
import { Button } from "../ui/button";
import { UserMenu } from "./user-menu";
import { Kbd } from "@/components/ui/kbd";
import { MobileHeader } from "./mobile-header";
import Link from "next/link";
import { SearchModal } from "./search-modal";
import { useHotkey, formatForDisplay } from "@tanstack/react-hotkeys";

export default function Header({ className }: { className?: string }) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const mobileRef = useRef<HTMLDivElement>(null);
    const desktopRef = useRef<HTMLElement>(null);

    useHotkey("Mod+K", () => {
        setSearchOpen((open) => !open);
    });

    useEffect(() => {
        const update = () => {
            const h =
                (mobileRef.current?.offsetHeight ?? 0) ||
                (desktopRef.current?.offsetHeight ?? 0);
            document.documentElement.style.setProperty(
                "--header-height",
                `${h}px`
            );
        };
        update();
        const observer = new ResizeObserver(update);
        if (mobileRef.current) observer.observe(mobileRef.current);
        if (desktopRef.current) observer.observe(desktopRef.current);
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
            <div ref={mobileRef} className={cn("md:hidden", className)}>
                <MobileHeader />
            </div>
            <header
                ref={desktopRef}
                className={cn(
                    "sticky top-0 z-50 hidden w-full m-auto items-center justify-between bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 box-border p-5 md:flex",
                    isScrolled && "border-b",
                    className
                )}
            >
                <div className="w-full items-center justify-between md:flex wide-lock-wider">
                    <Link href={"/"}>
                        <DynamicLogo width={175} className="shrink-0" />
                    </Link>
                    <div className="flex items-center gap-2 w-full justify-end">
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
