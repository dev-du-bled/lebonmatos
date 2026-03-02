"use client";

import * as React from "react";
import { SortingState } from "@tanstack/react-table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { DataTable } from "@/components/admin/data-table";
import { makeColumns } from "./columns";

const SEARCH_FIELDS = [
    { value: "email", label: "Email", placeholder: "Rechercher par email..." },
    { value: "name", label: "Nom", placeholder: "Rechercher par nom..." },
];

export default function AccountsPage() {
    const queryClient = useQueryClient();

    const [pageIndex, setPageIndex] = React.useState(0);
    const [pageSize, setPageSize] = React.useState(10);
    const [sorting, setSorting] = React.useState<SortingState>([
        { id: "createdAt", desc: true },
    ]);
    const [searchValue, setSearchValue] = React.useState("");
    const [searchField, setSearchField] = React.useState<"email" | "name">(
        "email"
    );

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

    const handleMutationSuccess = React.useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    }, [queryClient]);

    const columns = React.useMemo(
        () => makeColumns(handleMutationSuccess),
        [handleMutationSuccess]
    );

    const handleSearch = React.useCallback((value: string, field: string) => {
        setSearchValue(value);
        setSearchField(field as "email" | "name");
    }, []);

    return (
        <div className="p-6 space-y-4">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                    Utilisateurs
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Gérez les comptes utilisateurs.
                </p>
            </div>

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
        </div>
    );
}
