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

export default function Header({
  initialSession,
  className,
}: {
  initialSession?: unknown;
  className?: string;
}) {
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
        <MobileHeader initialSession={initialSession} />
      </div>
      <header
        className={cn(
          "sticky top-0 z-50 hidden w-full m-auto items-center justify-between bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 box-border p-5 md:flex",
          isScrolled && "border-b",
          className
        )}
      >
        <Link href={"/"}>
          <DynamicLogo width={175} className="shrink-0" />
        </Link>
        <div className="flex items-center gap-2 w-full justify-end">
          <Link href="/create-post">
            <Button className="hover:cursor-pointer">Publier</Button>
          </Link>
          <button className="flex h-8 w-full max-w-[200px] items-center justify-between rounded-sm bg-secondary px-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <SearchIcon className="size-4 shrink-0 opacity-50" />
              <span>Rechercher</span>
            </div>
            {modifierKey && <Kbd className="border">{modifierKey}+K</Kbd>}
          </button>
          <UserMenu initialSession={initialSession} />
        </div>
      </header>
    </>
  );
}
