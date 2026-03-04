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
        value: "search",
        label: "Rechercher",
        placeholder: "Rechercher par nom, email, téléphone...",
    },
];

export function UsersDataTable() {
    const queryClient = useQueryClient();

    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [sorting, setSorting] = useState<SortingState>([
        { id: "createdAt", desc: true },
    ]);
    const [searchValue, setSearchValue] = useState("");

    const sortField = sorting[0]?.id ?? "createdAt";
    const sortOrder = sorting[0]?.desc === false ? "asc" : "desc";

    const validSortFields = [
        "createdAt",
        "name",
        "email",
        "updatedAt",
    ] as const;
    const safeSortBy = validSortFields.includes(
        sortField as (typeof validSortFields)[number]
    )
        ? (sortField as (typeof validSortFields)[number])
        : "createdAt";

    const { data, isFetching } = trpc.admin.listUsers.useQuery({
        limit: pageSize,
        offset: pageIndex * pageSize,
        sortBy: safeSortBy,
        sortDirection: sortOrder,
        ...(searchValue ? { search: searchValue } : {}),
    });

    const handleMutationSuccess = useCallback(() => {
        queryClient.invalidateQueries({
            queryKey: getQueryKey(trpc.admin.listUsers),
        });
    }, [queryClient]);

    const columns = useMemo(
        () => makeColumns(handleMutationSuccess),
        [handleMutationSuccess]
    );

    const handleSearch = useCallback((value: string) => {
        setSearchValue(value);
        setPageIndex(0);
    }, []);

    return (
        <DataTable
            columns={columns}
            data={data?.users ?? []}
            totalCount={data?.total ?? 0}
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
