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
import type { REPORT_TYPE } from "@prisma/client";
import Link from "next/link";

export type UserReportRow = {
    id: string;
    reason: REPORT_TYPE;
    details: string | null;
    reportedAt: Date | string;
    user: { id: string; name: string | null; email: string | null } | null;
    reportedUser: {
        id: string;
        name: string | null;
        email: string | null;
    } | null;
};

const reasonLabel: Record<REPORT_TYPE, string> = {
    SPAM: "Spam",
    INNAPPROPRIATE: "Inapproprié",
    HARASSMENT: "Harcèlement",
    SCAM: "Arnaque",
    OTHER: "Autre",
};

const reasonVariant: Record<
    REPORT_TYPE,
    "destructive" | "secondary" | "outline"
> = {
    SPAM: "secondary",
    INNAPPROPRIATE: "destructive",
    HARASSMENT: "destructive",
    SCAM: "destructive",
    OTHER: "outline",
};

function SortableHeader({
    column,
    title,
}: {
    column: Column<UserReportRow, unknown>;
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

function RowActions({ report }: { report: UserReportRow }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Ouvrir le menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {report.user && (
                    <DropdownMenuItem asChild>
                        <Link
                            href={`/profile/${report.user.id}`}
                            target="_blank"
                            rel="noreferrer"
                        >
                            Voir le profil de l&apos;initiateur
                        </Link>
                    </DropdownMenuItem>
                )}
                {report.reportedUser && (
                    <DropdownMenuItem asChild>
                        <Link
                            href={`/profile/${report.reportedUser.id}`}
                            target="_blank"
                            rel="noreferrer"
                        >
                            Voir le profil signalé
                        </Link>
                    </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem>Marquer comme résolu</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                    Supprimer
                </DropdownMenuItem>
                <DropdownMenuSeparator />
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function makeColumns(): ColumnDef<UserReportRow>[] {
    return [
        {
            accessorKey: "reportedAt",
            header: ({ column }) => (
                <SortableHeader column={column} title="Date" />
            ),
            cell: ({ row }) =>
                new Date(row.getValue("reportedAt")).toLocaleDateString(
                    "fr-FR",
                    {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                    }
                ),
        },
        {
            accessorKey: "reason",
            header: ({ column }) => (
                <SortableHeader column={column} title="Raison" />
            ),
            cell: ({ row }) => {
                const reason = row.getValue<REPORT_TYPE>("reason");
                return (
                    <Badge
                        variant={reasonVariant[reason]}
                        className="capitalize"
                    >
                        {reasonLabel[reason]}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "reportedUser",
            header: "Utilisateur",
            cell: ({ row }) => {
                const user = row.original.reportedUser;
                if (!user)
                    return (
                        <span className="text-muted-foreground text-sm">—</span>
                    );
                return (
                    <div className="flex flex-col">
                        <span className="text-sm font-medium">
                            {user.name ?? "—"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {user.email}
                        </span>
                    </div>
                );
            },
            enableSorting: false,
        },
        {
            accessorKey: "user",
            header: "Initiateur",
            cell: ({ row }) => {
                const user = row.original.user;
                if (!user)
                    return (
                        <span className="text-muted-foreground text-sm">—</span>
                    );
                return (
                    <div className="flex flex-col">
                        <span className="text-sm font-medium">
                            {user.name ?? "—"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {user.email}
                        </span>
                    </div>
                );
            },
            enableSorting: false,
        },
        {
            accessorKey: "details",
            header: "Détails",
            cell: ({ row }) => {
                const details = row.getValue<string | null>("details");
                if (!details)
                    return (
                        <span className="text-muted-foreground text-sm italic">
                            Aucun détail fourni
                        </span>
                    );
                return (
                    <span
                        className="max-w-62.5 truncate block text-sm"
                        title={details}
                    >
                        {details}
                    </span>
                );
            },
            enableSorting: false,
        },
        {
            id: "actions",
            cell: ({ row }) => <RowActions report={row.original} />,
        },
    ];
}
