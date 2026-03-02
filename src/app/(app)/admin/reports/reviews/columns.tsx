"use client";

import { Column, ColumnDef } from "@tanstack/react-table";
import {
    ArrowDown,
    ArrowUp,
    ChevronsUpDown,
    MoreHorizontal,
    Star,
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
import { reasonLabel } from "@/lib/report";
import { trpc } from "@/trpc/client";

export type ReportRow = {
    id: string;
    reason: REPORT_TYPE;
    details: string | null;
    type: string;
    postId: string | null;
    userId: string | null;
    messageId: string | null;
    ratingId: string | null;
    reportedAt: Date | string;
    post: { id: string; title: string | null } | null;
    rating: {
        id: string;
        rating: number;
        comment: string | null;
        rater: { id: string; name: string | null } | null;
        user: { id: string; name: string | null } | null;
    } | null;
    user: { id: string; name: string | null; email: string | null } | null;
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
    onMutationSuccess,
}: {
    report: ReportRow;
    onMutationSuccess: () => void;
}) {
    const resolve = trpc.reports.resolveReport.useMutation({
        onSuccess: onMutationSuccess,
    });
    const remove = trpc.reports.deleteReport.useMutation({
        onSuccess: onMutationSuccess,
    });

    const isPending = resolve.isPending || remove.isPending;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    disabled={isPending}
                >
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Navigation</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {report.post && (
                    <DropdownMenuItem asChild>
                        <Link
                            href={`/post/${report.post.id}`}
                            target="_blank"
                            rel="noreferrer"
                        >
                            Voir l&apos;annonce
                        </Link>
                    </DropdownMenuItem>
                )}
                {report.user && (
                    <DropdownMenuItem asChild>
                        <Link
                            href={`/profile/${report.user.id}`}
                            target="_blank"
                            rel="noreferrer"
                        >
                            Voir le profil du reporter
                        </Link>
                    </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    disabled={isPending}
                    onClick={() => resolve.mutate({ id: report.id })}
                >
                    Marquer comme résolu
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    disabled={isPending}
                    onClick={() => remove.mutate({ id: report.id })}
                >
                    Supprimer
                </DropdownMenuItem>
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
            accessorKey: "rating",
            header: "Avis",
            cell: ({ row }) => {
                const rating = row.original.rating;
                if (!rating)
                    return (
                        <span className="text-muted-foreground text-sm">—</span>
                    );
                return (
                    <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1 text-sm font-medium">
                            <Star className="h-3.5 w-3.5 fill-current text-yellow-500" />
                            {rating.rating}/5
                            {rating.rater && (
                                <span className="text-muted-foreground font-normal">
                                    — {rating.rater.name ?? "—"}
                                </span>
                            )}
                        </div>
                        {rating.comment && (
                            <span
                                className="max-w-50 truncate block text-xs text-muted-foreground"
                                title={rating.comment}
                            >
                                {rating.comment}
                            </span>
                        )}
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
            header: "Details",
            cell: ({ row }) => {
                const details = row.getValue<string | null>("details");
                if (!details)
                    return (
                        <span className="text-muted-foreground text-sm italic">
                            Aucun détail fourni.
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
