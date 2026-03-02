"use client";

import * as React from "react";
import { SortingState } from "@tanstack/react-table";
import { trpc } from "@/trpc/client";
import { DataTable } from "./data-table";
import { columns } from "./columns";

export default function PostsReportsPage() {
    const [pageIndex, setPageIndex] = React.useState(0);
    const [pageSize, setPageSize] = React.useState(10);
    const [sorting, setSorting] = React.useState<SortingState>([
        { id: "reportedAt", desc: true },
    ]);

    const sortField = sorting[0]?.id ?? "reportedAt";
    const sortOrder = sorting[0]?.desc === false ? "asc" : "desc";

    const validSortFields = ["reportedAt", "reason", "type"] as const;
    const safeSortBy = validSortFields.includes(
        sortField as (typeof validSortFields)[number]
    )
        ? (sortField as (typeof validSortFields)[number])
        : "reportedAt";

    const { data, isFetching } = trpc.reports.getReports.useQuery({
        type: "POST",
        limit: pageSize,
        offset: pageIndex * pageSize,
        sortBy: safeSortBy,
        sortOrder,
    });

    return (
        <div className="p-6 space-y-4">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                    Siganlements d&apos;Annonces
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Gérez les signalements d&apos;annonces.
                </p>
            </div>

            <DataTable
                columns={columns}
                data={data?.reports ?? []}
                totalCount={data?.totalCount ?? 0}
                pageIndex={pageIndex}
                pageSize={pageSize}
                sorting={sorting}
                isLoading={isFetching}
                onPageChange={setPageIndex}
                onPageSizeChange={setPageSize}
                onSortingChange={setSorting}
            />
        </div>
    );
}
