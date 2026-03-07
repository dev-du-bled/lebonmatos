"use client";

import { Button } from "../ui/button";
import {
    HeartIcon,
    ListIcon,
    MessageCircleIcon,
    SettingsIcon,
    UserIcon,
} from "lucide-react";
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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "../ui/tooltip";

export function UserMenu() {
    const { session } = useSession();

    if (!session?.user?.name)
        return (
            <Link className="shrink-0" href="/login">
                <Button variant="outline">Se connecter</Button>
            </Link>
        );

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Link className="shrink-0 relative inline-flex" href="/messages">
                        <Button variant="ghost" size="icon">
                            <MessageCircleIcon className="size-4 shrink-0 opacity-50" />
                        </Button>
                        <UnreadBadge />
                    </Link>
                </TooltipTrigger>
                <TooltipContent>Messages</TooltipContent>
            </Tooltip>
            <DropdownMenu>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <UserIcon className="size-4 shrink-0 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent>Mon compte</TooltipContent>
                </Tooltip>
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
                        <Link href="/profile">
                            <UserIcon className="size-4" />
                            Mon profil
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href="/profile/listings">
                            <ListIcon className="size-4" />
                            Mes annonces
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href="/profile/favorites">
                            <HeartIcon className="size-4" />
                            Favoris
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href="/profile/configurations">
                            <SettingsIcon className="size-4" />
                            Configurations
                        </Link>
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
        </TooltipProvider>
    );
}
