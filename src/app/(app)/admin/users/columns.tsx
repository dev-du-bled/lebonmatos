"use client";

import { Column, ColumnDef } from "@tanstack/react-table";
import {
    ArrowDown,
    ArrowUp,
    ChevronsUpDown,
    MoreHorizontal,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import Link from "next/link";
import { useSession } from "@/components/auth/session-provider";

export type UserRow = {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image?: string | null;
    createdAt: Date;
    updatedAt: Date;
    role?: string | null;
    banned: boolean | null;
    banReason?: string | null;
    banExpires?: Date | null;
};

function SortableHeader({
    column,
    title,
}: {
    column: Column<UserRow, unknown>;
    title: string;
}) {
    return (
        <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
            {title}
            {column.getIsSorted() === "desc" ? (
                <ArrowDown className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "asc" ? (
                <ArrowUp className="ml-2 h-4 w-4" />
            ) : (
                <ChevronsUpDown className="ml-2 h-4 w-4 text-muted-foreground/50" />
            )}
        </Button>
    );
}

function RowActions({
    user,
    onMutationSuccess,
}: {
    user: UserRow;
    onMutationSuccess: () => void;
}) {
    const { session } = useSession();
    const [isPending, setIsPending] = useState(false);

    const handleBan = async () => {
        setIsPending(true);
        await authClient.admin.banUser({ userId: user.id });
        setIsPending(false);
        onMutationSuccess();
    };

    const handleUnban = async () => {
        setIsPending(true);
        await authClient.admin.unbanUser({ userId: user.id });
        setIsPending(false);
        onMutationSuccess();
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Ouvrir le menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Navigation</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link
                        href={`/profile/${user.id}`}
                        target="_blank"
                        rel="noreferrer"
                    >
                        Voir le profil
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user.banned ? (
                    <DropdownMenuItem
                        onClick={handleUnban}
                        disabled={isPending || session?.user.id === user.id}
                    >
                        Débannir
                    </DropdownMenuItem>
                ) : (
                    <DropdownMenuItem
                        onClick={handleBan}
                        disabled={isPending || session?.user.id === user.id}
                        className="text-destructive focus:text-destructive"
                    >
                        Bannir
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function makeColumns(
    onMutationSuccess: () => void
): ColumnDef<UserRow>[] {
    return [
        {
            accessorKey: "name",
            header: ({ column }) => (
                <SortableHeader column={column} title="Utilisateur" />
            ),
            cell: ({ row }) => {
                const user = row.original;
                return (
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                            <AvatarImage
                                src={user.image ?? undefined}
                                alt={user.name}
                            />
                            <AvatarFallback className="text-xs">
                                {user.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{user.name}</span>
                    </div>
                );
            },
        },
        {
            accessorKey: "email",
            header: ({ column }) => (
                <SortableHeader column={column} title="Email" />
            ),
            cell: ({ row }) => {
                const { email, emailVerified } = row.original;
                return (
                    <div className="flex flex-col">
                        <span className="text-sm">{email}</span>
                        {!emailVerified && (
                            <span className="text-xs text-muted-foreground">
                                Non vérifié
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: "role",
            header: "Rôle",
            cell: ({ row }) => {
                const role = row.getValue<string | null>("role");
                return role === "admin" ? (
                    <Badge variant="info">Admin</Badge>
                ) : (
                    <Badge variant="secondary">Utilisateur</Badge>
                );
            },
            enableSorting: false,
        },
        {
            accessorKey: "banned",
            header: "Statut",
            cell: ({ row }) => {
                const { banned, banReason } = row.original;
                return banned ? (
                    <Badge
                        variant="destructive"
                        className="cursor-default"
                        title={banReason ?? undefined}
                    >
                        Banni
                    </Badge>
                ) : (
                    <Badge variant="outline">Actif</Badge>
                );
            },
            enableSorting: false,
        },
        {
            accessorKey: "createdAt",
            header: ({ column }) => (
                <SortableHeader column={column} title="Inscrit le" />
            ),
            cell: ({ row }) =>
                new Date(row.getValue("createdAt")).toLocaleDateString(
                    "fr-FR",
                    {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                    }
                ),
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <RowActions
                    user={row.original}
                    onMutationSuccess={onMutationSuccess}
                />
            ),
        },
    ];
}
