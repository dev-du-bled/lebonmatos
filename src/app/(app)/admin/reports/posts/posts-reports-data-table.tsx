"use client";

import { SortingState } from "@tanstack/react-table";
import { trpc } from "@/trpc/client";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { DataTable } from "@/components/admin/data-table";
import { makeColumns } from "./columns";
import { useState, useCallback, useMemo } from "react";

const SEARCH_FIELDS = [
    {
        value: "details",
        label: "Détails",
        placeholder: "Rechercher dans les détails...",
    },
    {
        value: "reporterEmail",
        label: "Email Initiateur",
        placeholder: "Rechercher par email...",
    },
    {
        value: "reporterName",
        label: "Nom Initiateur",
        placeholder: "Rechercher par nom...",
    },
];

export function PostsReportsDataTable() {
    const queryClient = useQueryClient();

    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [sorting, setSorting] = useState<SortingState>([
        { id: "reportedAt", desc: true },
    ]);
    const [search, setSearch] = useState("");
    const [searchField, setSearchField] = useState("details");

    const sortField = sorting[0]?.id ?? "reportedAt";
    const sortOrder = sorting[0]?.desc === false ? "asc" : "desc";

    const validSortFields = ["reportedAt", "reason", "status"] as const;
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
        ...(search
            ? {
                  search,
                  searchField: searchField as
                      | "details"
                      | "reporterEmail"
                      | "reporterName",
              }
            : {}),
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

    const handleSearch = useCallback((value: string, field: string) => {
        setSearch(value);
        setSearchField(field);
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
        />
    );
}
