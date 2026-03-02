"use client";

import { SortingState } from "@tanstack/react-table";
import { trpc } from "@/trpc/client";
import { DataTable } from "@/components/admin/data-table";
import { makeColumns } from "./columns";
import { useState, useCallback, useMemo } from "react";

const SEARCH_FIELDS = [
    {
        value: "reportedUserName",
        label: "Nom signalé",
        placeholder: "Rechercher par nom...",
    },
    {
        value: "reportedUserEmail",
        label: "Email signalé",
        placeholder: "Rechercher par email...",
    },
    {
        value: "reporterName",
        label: "Nom initiateur",
        placeholder: "Rechercher par nom de l'initiateur...",
    },
    {
        value: "details",
        label: "Détails",
        placeholder: "Rechercher dans les détails...",
    },
];

export function AccountsReportsDataTable() {
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [sorting, setSorting] = useState<SortingState>([
        { id: "reportedAt", desc: true },
    ]);
    const [search, setSearch] = useState("");
    const [searchField, setSearchField] = useState("reportedUserName");

    const sortField = sorting[0]?.id ?? "reportedAt";
    const sortOrder = sorting[0]?.desc === false ? "asc" : "desc";

    const validSortFields = ["reportedAt", "reason", "type"] as const;
    const safeSortBy = validSortFields.includes(
        sortField as (typeof validSortFields)[number]
    )
        ? (sortField as (typeof validSortFields)[number])
        : "reportedAt";

    const { data, isFetching } = trpc.reports.getReports.useQuery({
        type: "USER",
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
                      | "reporterName"
                      | "reportedUserName"
                      | "reportedUserEmail",
              }
            : {}),
    });

    const columns = useMemo(() => makeColumns(), []);

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
