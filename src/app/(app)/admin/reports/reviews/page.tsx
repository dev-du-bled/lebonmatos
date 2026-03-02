"use client";

import { SortingState } from "@tanstack/react-table";
import { trpc } from "@/trpc/client";
import { DataTable } from "@/components/admin/data-table";
import { columns } from "./columns";
import { useState, useCallback } from "react";

const SEARCH_FIELDS = [
    {
        value: "details",
        label: "Détails",
        placeholder: "Rechercher dans les détails...",
    },
    {
        value: "reporterEmail",
        label: "Email reporter",
        placeholder: "Rechercher par email...",
    },
    {
        value: "reporterName",
        label: "Nom reporter",
        placeholder: "Rechercher par nom...",
    },
];

export default function ReviewsReportsPage() {
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [sorting, setSorting] = useState<SortingState>([
        { id: "reportedAt", desc: true },
    ]);
    const [search, setSearch] = useState("");
    const [searchField, setSearchField] = useState("details");

    const sortField = sorting[0]?.id ?? "reportedAt";
    const sortOrder = sorting[0]?.desc === false ? "asc" : "desc";

    const validSortFields = ["reportedAt", "reason", "type"] as const;
    const safeSortBy = validSortFields.includes(
        sortField as (typeof validSortFields)[number]
    )
        ? (sortField as (typeof validSortFields)[number])
        : "reportedAt";

    const { data, isFetching } = trpc.reports.getReports.useQuery({
        type: "REVIEW",
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
