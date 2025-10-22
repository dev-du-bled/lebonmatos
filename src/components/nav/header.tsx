"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { DynamicLogo } from "../dynamic-logo";
import { SearchIcon } from "lucide-react";
import { Button } from "../ui/button";
import { UserMenu } from "./user-menu";
export default function Header({
  initialSession,
}: {
  initialSession?: unknown;
}) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full flex items-center justify-between bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 box-border p-5",
        isScrolled && "border-b"
      )}
    >
      <DynamicLogo width={175} className="flex-shrink-0" />
      <div className="flex items-center gap-2 w-full justify-end">
        <Button>Publier</Button>
        <button className="flex h-8 w-full max-w-xs items-center justify-between rounded-sm bg-secondary px-2 text-sm text-muted-foreground">
          <span>Rechercher</span>
          <SearchIcon className="size-4 shrink-0 opacity-50" />
        </button>
        <UserMenu initialSession={initialSession} />
      </div>
    </header>
  );
}
