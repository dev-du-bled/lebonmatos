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
import { auth } from "@/lib/auth";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export function UserMenu({ initialSession }: { initialSession?: unknown }) {
  const { data, isPending } = authClient.useSession();
  const router = useRouter();
  const actualPath = usePathname();

  const session = (isPending ? initialSession : data) as
    | Awaited<ReturnType<typeof auth.api.getSession>>
    | null
    | undefined;

  const logout = async () => {
    await authClient.signOut();
    router.refresh();
  };

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
          <DropdownMenuItem onClick={logout}>Se déconnecter</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
