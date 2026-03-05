"use client";

import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

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
import { trpc } from "@/trpc/client";

export function UserMenu() {
    const { session } = useSession();
    const [unreadTotal, setUnreadTotal] = useState(0);

    const { data: discussions } = trpc.discussions.getDiscussions.useQuery(
        undefined,
        { enabled: !!session?.user }
    );

    const utils = trpc.useUtils();

    useEffect(() => {
        if (discussions) {
            setUnreadTotal(
                discussions.reduce((sum, d) => sum + d.unreadCount, 0)
            );
        }
    }, [discussions]);

    trpc.discussions.onNewMessage.useSubscription(undefined, {
        enabled: !!session?.user,
        onData: () => {
            void utils.discussions.getDiscussions.invalidate();
        },
    });

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
                {unreadTotal > 0 && (
                    <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 size-4 p-0 text-[10px] flex items-center justify-center pointer-events-none"
                    >
                        {unreadTotal > 9 ? "9+" : unreadTotal}
                    </Badge>
                )}
            </Link>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
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
