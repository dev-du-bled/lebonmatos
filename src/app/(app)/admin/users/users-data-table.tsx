"use client";

import { SortingState } from "@tanstack/react-table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { DataTable } from "@/components/admin/data-table";
import { makeColumns } from "./columns";
import { useState, useCallback, useMemo } from "react";

const SEARCH_FIELDS = [
    { value: "email", label: "Email", placeholder: "Rechercher par email..." },
    { value: "name", label: "Nom", placeholder: "Rechercher par nom..." },
];

export function UsersDataTable() {
    const queryClient = useQueryClient();

    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [sorting, setSorting] = useState<SortingState>([
        { id: "createdAt", desc: true },
    ]);
    const [searchValue, setSearchValue] = useState("");
    const [searchField, setSearchField] = useState<"email" | "name">("email");

    const sortField = sorting[0]?.id ?? "createdAt";
    const sortOrder = sorting[0]?.desc === false ? "asc" : "desc";

    const queryKey = [
        "admin",
        "users",
        pageIndex,
        pageSize,
        sortField,
        sortOrder,
        searchField,
        searchValue,
    ];

    const { data, isFetching } = useQuery({
        queryKey,
        queryFn: async () => {
            const result = await authClient.admin.listUsers({
                query: {
                    limit: pageSize,
                    offset: pageIndex * pageSize,
                    sortBy: sortField,
                    sortDirection: sortOrder,
                    ...(searchValue
                        ? {
                              searchValue,
                              searchField,
                              searchOperator: "contains" as const,
                          }
                        : {}),
                },
            });
            if (result.error) throw result.error;
            return result.data;
        },
    });

    const handleMutationSuccess = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    }, [queryClient]);

    const columns = useMemo(
        () => makeColumns(handleMutationSuccess),
        [handleMutationSuccess]
    );

    const handleSearch = useCallback((value: string, field: string) => {
        setSearchValue(value);
        setSearchField(field as "email" | "name");
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
