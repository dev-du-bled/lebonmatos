"use client";

import { Button } from "../ui/button";

import { BellIcon, MessageCircleIcon, UserIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface UserMenuProps {
  initialSession?: typeof authClient.$Infer.Session | null;
}

export function UserMenu({ initialSession }: UserMenuProps) {
  const { data, isPending } = authClient.useSession();
  const actualPath = usePathname();

  const session = isPending ? initialSession : data;

  if (!session?.user?.name)
    return (
      <Link
        className="shrink-0"
        href={`/login${
          actualPath !== "/"
            ? `?from=${encodeURIComponent(actualPath ?? "/")}`
            : ""
        }`}
      >
        <Button variant="outline" size="sm">
          Se connecter
        </Button>
      </Link>
    );

  return (
    <div>
      <Button variant="ghost" size="icon">
        <BellIcon className="size-4 shrink-0 opacity-50" />
      </Button>
      <Link className="shrink-0" href="/messages">
        <Button variant="ghost" size="icon">
          <MessageCircleIcon className="size-4 shrink-0 opacity-50" />
        </Button>
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <UserIcon className="size-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={8} collisionPadding={12}>
          <DropdownMenuLabel>
            Bienvenue, <span className="font-bold">{session.user.name}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => authClient.signOut()}>
            Se déconnecter
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
