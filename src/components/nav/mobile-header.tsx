"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { DynamicLogo } from "../dynamic-logo";
import { Button } from "../ui/button";
import { Menu } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import Link from "next/link";
import { UserMenu } from "./user-menu";
import { authClient } from "@/lib/auth-client";

export function MobileHeader({ initialSession }: { initialSession?: unknown }) {
    const [open, setOpen] = useState(false);

    return (
        <header
            className={cn(
                "sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 box-border p-4 border-b md:hidden"
            )}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Sheet open={open} onOpenChange={setOpen}>
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label="Open menu"
                            >
                                <Menu className="size-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0">
                            <SheetHeader className="p-4 border-b">
                                <SheetTitle>
                                    <DynamicLogo width={140} />
                                </SheetTitle>
                            </SheetHeader>
                            <nav className="p-3">
                                <ul className="grid gap-1">
                                    <li>
                                        <Link
                                            href="/"
                                            onClick={() => setOpen(false)}
                                            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                                        >
                                            Accueil
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/explore"
                                            onClick={() => setOpen(false)}
                                            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                                        >
                                            Explorer
                                        </Link>
                                    </li>
                                </ul>
                            </nav>
                        </SheetContent>
                    </Sheet>
                    <Link href={"/"}>
                        <DynamicLogo width={120} className="shrink-0" />
                    </Link>
                </div>

                <UserMenu initialSession={initialSession} />
            </div>
        </header>
    );
}
