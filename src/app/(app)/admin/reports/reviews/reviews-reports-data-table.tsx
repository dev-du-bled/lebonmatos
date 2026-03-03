"use client";

import { SortingState } from "@tanstack/react-table";
import { trpc } from "@/trpc/client";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { DataTable } from "@/components/admin/data-table";
import { ReportFilters } from "@/components/admin/report-filters";
import { makeColumns } from "./columns";
import { useState, useCallback, useMemo } from "react";
import { REPORT_TYPE, REPORT_STATUS } from "@prisma/client";

const SEARCH_FIELDS = [
    {
        value: "search",
        label: "Rechercher",
        placeholder: "Rechercher par nom, email, détails...",
    },
];

function parseFilters(filters: string[]) {
    const reasons = filters
        .filter((f) => f.startsWith("reason:"))
        .map((f) => f.slice("reason:".length) as REPORT_TYPE);
    const statuses = filters
        .filter((f) => f.startsWith("status:"))
        .map((f) => f.slice("status:".length) as REPORT_STATUS);
    return { reasons, statuses };
}

export function ReviewsReportsDataTable() {
    const queryClient = useQueryClient();

    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [sorting, setSorting] = useState<SortingState>([
        { id: "reportedAt", desc: true },
    ]);
    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState<string[]>([]);

    const sortField = sorting[0]?.id ?? "reportedAt";
    const sortOrder = sorting[0]?.desc === false ? "asc" : "desc";

    const validSortFields = ["reportedAt", "reason", "status"] as const;
    const safeSortBy = validSortFields.includes(
        sortField as (typeof validSortFields)[number]
    )
        ? (sortField as (typeof validSortFields)[number])
        : "reportedAt";

    const { reasons, statuses } = parseFilters(filters);

    const { data, isFetching } = trpc.reports.getReports.useQuery({
        type: "REVIEW",
        limit: pageSize,
        offset: pageIndex * pageSize,
        sortBy: safeSortBy,
        sortOrder,
        ...(search ? { search } : {}),
        ...(reasons.length > 0 ? { reasons } : {}),
        ...(statuses.length > 0 ? { statuses } : {}),
    });

    const handleMutationSuccess = useCallback(() => {
        queryClient.invalidateQueries({
            queryKey: getQueryKey(trpc.reports.getReports),
        });
    }, [queryClient]);

    const columns = useMemo(
        () => makeColumns(handleMutationSuccess),
        [handleMutationSuccess]
    );

    const handleSearch = useCallback((value: string) => {
        setSearch(value);
        setPageIndex(0);
    }, []);

    const handleFiltersChange = useCallback((value: string[]) => {
        setFilters(value);
        setPageIndex(0);
    }, []);

    return (
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
            searchFields={SEARCH_FIELDS}
            onSearch={handleSearch}
            toolbar={
                <ReportFilters value={filters} onChange={handleFiltersChange} />
            }
        />
    );
}
