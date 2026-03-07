"use client";

import { Button } from "../ui/button";
import { MessageCircleIcon, UserIcon } from "lucide-react";
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
import { useSession } from "../auth/session-provider";
import { UnreadBadge } from "./unread-badge";

export function UserMenu() {
    const { session } = useSession();

    if (!session?.user?.name)
        return (
            <Link className="shrink-0" href="/login">
                <Button variant="outline">Se connecter</Button>
            </Link>
        );

    return (
        <div>
            <Link className="shrink-0 relative inline-flex" href="/messages">
                <Button variant="ghost" size="icon">
                    <MessageCircleIcon className="size-4 shrink-0 opacity-50" />
                </Button>
                <UnreadBadge />
            </Link>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Menu utilisateur"
                    >
                        <UserIcon className="size-4 shrink-0 opacity-50" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="end"
                    sideOffset={8}
                    collisionPadding={12}
                >
                    <DropdownMenuLabel>
                        Bienvenue,{" "}
                        <span className="font-bold">
                            {session.user.username ?? session.user.name}
                        </span>
                    </DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                        <Link href="/profile">Mon profil</Link>
                    </DropdownMenuItem>
                    {session.user.role === "admin" && (
                        <DropdownMenuItem asChild>
                            <Link href="/admin">Administration</Link>
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => authClient.signOut()}>
                        Se déconnecter
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
