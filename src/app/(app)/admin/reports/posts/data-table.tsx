"use client";

import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    useReactTable,
} from "@tanstack/react-table";
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    totalCount: number;
    pageIndex: number;
    pageSize: number;
    sorting: SortingState;
    isLoading?: boolean;
    onPageChange: (pageIndex: number) => void;
    onPageSizeChange: (pageSize: number) => void;
    onSortingChange: (sorting: SortingState) => void;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    totalCount,
    pageIndex,
    pageSize,
    sorting,
    isLoading,
    onPageChange,
    onPageSizeChange,
    onSortingChange,
}: DataTableProps<TData, TValue>) {
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
        {}
    );

    const pageCount = Math.ceil(totalCount / pageSize);

    const table = useReactTable({
        data,
        columns,
        pageCount,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            pagination: { pageIndex, pageSize },
        },
        manualPagination: true,
        manualSorting: true,
        onSortingChange: (updater) => {
            const next =
                typeof updater === "function" ? updater(sorting) : updater;
            onSortingChange(next);
            onPageChange(0);
        },
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <Input
                placeholder="Filter details..."
                value={
                    (table.getColumn("details")?.getFilterValue() as string) ??
                    ""
                }
                onChange={(e) =>
                    table.getColumn("details")?.setFilterValue(e.target.value)
                }
                className="max-w-xs h-8"
            />

            {/* Table */}
            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef
                                                      .header,
                                                  header.getContext()
                                              )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: pageSize }).map((_, i) => (
                                <TableRow key={i}>
                                    {columns.map((_, j) => (
                                        <TableCell key={j}>
                                            <Skeleton className="h-4 w-full" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    No reports found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-1">
                <p className="text-sm text-muted-foreground">
                    {totalCount} report{totalCount !== 1 ? "s" : ""} total
                </p>

                <div className="flex items-center gap-6 lg:gap-8">
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">Rows per page</p>
                        <Select
                            value={`${pageSize}`}
                            onValueChange={(v) => {
                                onPageSizeChange(Number(v));
                                onPageChange(0);
                            }}
                        >
                            <SelectTrigger className="h-8 w-17.5">
                                <SelectValue placeholder={pageSize} />
                            </SelectTrigger>
                            <SelectContent side="top">
                                {[10, 20, 30, 50].map((size) => (
                                    <SelectItem key={size} value={`${size}`}>
                                        {size}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex w-27.5 items-center justify-center text-sm font-medium">
                        Page {pageIndex + 1} of {pageCount || 1}
                    </div>

                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="icon"
                            className="hidden size-8 lg:flex"
                            onClick={() => onPageChange(0)}
                            disabled={pageIndex === 0}
                        >
                            <span className="sr-only">First page</span>
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="size-8"
                            onClick={() => onPageChange(pageIndex - 1)}
                            disabled={pageIndex === 0}
                        >
                            <span className="sr-only">Previous page</span>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="size-8"
                            onClick={() => onPageChange(pageIndex + 1)}
                            disabled={pageIndex >= pageCount - 1}
                        >
                            <span className="sr-only">Next page</span>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="hidden size-8 lg:flex"
                            onClick={() => onPageChange(pageCount - 1)}
                            disabled={pageIndex >= pageCount - 1}
                        >
                            <span className="sr-only">Last page</span>
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
