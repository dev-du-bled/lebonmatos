"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { DynamicLogo } from "../dynamic-logo";
import { SearchIcon } from "lucide-react";
import { Button } from "../ui/button";
import { UserMenu } from "./user-menu";
import { Kbd } from "@/components/ui/kbd";
import { MobileHeader } from "./mobile-header";
import Link from "next/link";

const NOISE_SVG =
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E\")";

export default function Header({ className }: { className?: string }) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [modifierKey, setModifierKey] = useState<string | null>(null);

    useEffect(() => {
        setModifierKey(
            typeof window !== "undefined" &&
                /Mac|iPhone|iPad|iPod/.test(navigator.userAgent)
                ? "⌘"
                : "Ctrl"
        );
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };

        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <>
            <div className={cn("md:hidden", className)}>
                <MobileHeader />
            </div>
            <header
                className={cn(
                    "sticky top-0 z-50 hidden w-full m-auto items-center justify-between box-border p-5 md:flex overflow-hidden",
                    "bg-background/90 backdrop-blur-[6px] backdrop-saturate-[120%]",
                    "border-b transition-colors duration-300",
                    isScrolled
                        ? "border-border/40 shadow-[0_1px_16px_rgba(0,0,0,0.05)]"
                        : "border-transparent",
                    className
                )}
            >
                {/* Grain texture */}
                <div
                    aria-hidden="true"
                    className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay"
                    style={{
                        backgroundImage: NOISE_SVG,
                        backgroundSize: "150px 150px",
                    }}
                />

                {/* Reflet spéculaire sur le bord supérieur */}
                <div
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none"
                />

                {/* Brillance surface */}
                <div
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none"
                />

                <div className="relative w-full items-center justify-between md:flex wide-lock">
                    <Link href={"/"}>
                        <DynamicLogo width={175} className="shrink-0" />
                    </Link>
                    <div className="flex items-center gap-2 w-full justify-end">
                        <Link href="/create-post">
                            <Button className="hover:cursor-pointer">
                                Publier
                            </Button>
                        </Link>
                        <button className="flex h-9 w-full max-w-50 items-center justify-between rounded-md bg-secondary px-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <SearchIcon className="size-4 shrink-0 opacity-50" />
                                <span>Rechercher</span>
                            </div>
                            {modifierKey && (
                                <Kbd className="border">{modifierKey}+K</Kbd>
                            )}
                        </button>
                        <UserMenu />
                    </div>
                </div>
            </header>
        </>
    );
}
