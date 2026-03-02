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
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

export interface SearchField {
    value: string;
    label: string;
    placeholder?: string;
}

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
    filterColumn?: string;
    filterPlaceholder?: string;
    searchFields?: SearchField[];
    onSearch?: (value: string, field: string) => void;
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
    filterColumn = "details",
    filterPlaceholder = "Rechercher...",
    searchFields,
    onSearch,
}: DataTableProps<TData, TValue>) {
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
        {}
    );

    const [inputValue, setInputValue] = useState("");
    const [activeField, setActiveField] = useState<string>(
        searchFields?.[0]?.value ?? ""
    );

    const [debouncedInput] = useDebounce(inputValue, 300);

    useEffect(() => {
        onSearch?.(debouncedInput, activeField);
        onPageChange(0);
    }, [debouncedInput, activeField, onSearch, onPageChange]);

    const handleInputChange = (value: string) => {
        setInputValue(value);
        if (!value) {
            onSearch?.("", activeField);
            onPageChange(0);
        }
    };

    const handleFieldChange = (field: string) => {
        setActiveField(field);
        if (inputValue) {
            onSearch?.(inputValue, field);
            onPageChange(0);
        }
    };

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

    const isServerSearch = !!searchFields;
    const currentField = searchFields?.find((f) => f.value === activeField);
    const activePlaceholder =
        currentField?.placeholder ??
        `Rechercher par ${currentField?.label ?? ""}...`;

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            {isServerSearch ? (
                <div className="flex items-center gap-2">
                    {searchFields.length > 1 && (
                        <Select
                            value={activeField}
                            onValueChange={handleFieldChange}
                        >
                            <SelectTrigger className="h-8 w-36">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {searchFields.map((f) => (
                                    <SelectItem key={f.value} value={f.value}>
                                        {f.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                    <Input
                        placeholder={activePlaceholder}
                        value={inputValue}
                        onChange={(e) => handleInputChange(e.target.value)}
                        className="max-w-xs h-8"
                    />
                </div>
            ) : (
                <Input
                    placeholder={filterPlaceholder}
                    value={
                        (table
                            .getColumn(filterColumn)
                            ?.getFilterValue() as string) ?? ""
                    }
                    onChange={(e) =>
                        table
                            .getColumn(filterColumn)
                            ?.setFilterValue(e.target.value)
                    }
                    className="max-w-xs h-8"
                />
            )}

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
                                    Aucun résultat trouvé.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-1">
                <p className="text-sm text-muted-foreground">
                    {totalCount} résultat{totalCount !== 1 ? "s" : ""}
                </p>

                <div className="flex items-center gap-6 lg:gap-8">
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">Lignes par page</p>
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
                        Page {pageIndex + 1} sur {pageCount || 1}
                    </div>

                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="icon"
                            className="hidden size-8 lg:flex"
                            onClick={() => onPageChange(0)}
                            disabled={pageIndex === 0}
                        >
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="size-8"
                            onClick={() => onPageChange(pageIndex - 1)}
                            disabled={pageIndex === 0}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="size-8"
                            onClick={() => onPageChange(pageIndex + 1)}
                            disabled={pageIndex >= pageCount - 1}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="hidden size-8 lg:flex"
                            onClick={() => onPageChange(pageCount - 1)}
                            disabled={pageIndex >= pageCount - 1}
                        >
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
