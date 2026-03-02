"use client";

import * as React from "react";
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
import { REPORT_TYPE } from "@prisma/client";

export type ReportRow = {
    id: string;
    reason: REPORT_TYPE;
    details: string | null;
    type: string;
    postId: string | null;
    userId: string | null;
    messageId: string | null;
    reportedAt: Date | string;
    post: { id: string; title: string | null } | null;
    user: { id: string; name: string | null; email: string | null } | null;
};

const reasonLabel: Record<REPORT_TYPE, string> = {
    SPAM: "Spam",
    INNAPPROPRIATE: "Inappropriate",
    HARASSMENT: "Harassment",
    SCAM: "Scam",
    OTHER: "Other",
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
    column: Column<ReportRow, unknown>;
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
    report,
}: {
    report: ReportRow;
    onMutationSuccess: () => void;
}) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                    onClick={() => navigator.clipboard.writeText(report.id)}
                >
                    Copy report ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {report.post && (
                    <DropdownMenuItem asChild>
                        <a
                            href={`/post/${report.post.id}`}
                            target="_blank"
                            rel="noreferrer"
                        >
                            View post
                        </a>
                    </DropdownMenuItem>
                )}
                {report.user && (
                    <DropdownMenuItem asChild>
                        <a
                            href={`/profile/${report.user.id}`}
                            target="_blank"
                            rel="noreferrer"
                        >
                            View reporter
                        </a>
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function makeColumns(
    onMutationSuccess: () => void
): ColumnDef<ReportRow>[] {
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
            accessorKey: "post",
            header: "Annonce",
            cell: ({ row }) => {
                const post = row.original.post;
                if (!post)
                    return (
                        <span className="text-muted-foreground text-sm">—</span>
                    );
                return (
                    <span className="max-w-50 truncate block text-sm font-medium">
                        {post.title ?? post.id}
                    </span>
                );
            },
            enableSorting: false,
        },
        {
            accessorKey: "user",
            header: "Reporter",
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
            cell: ({ row }) => (
                <RowActions
                    report={row.original}
                    onMutationSuccess={onMutationSuccess}
                />
            ),
        },
    ];
}

export const columns: ColumnDef<ReportRow>[] = makeColumns(() => {});
