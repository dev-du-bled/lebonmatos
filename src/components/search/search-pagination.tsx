import { memo } from "react";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    PaginationEllipsis,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

function PageItems({
    page,
    totalPages,
    onPageChange,
    linkClassName,
    activeLinkClassName,
}: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    linkClassName?: string;
    activeLinkClassName?: string;
}) {
    return Array.from({ length: totalPages }, (_, i) => {
        if (i === 0 || i === totalPages - 1 || Math.abs(i - page) <= 1) {
            return (
                <PaginationItem key={i}>
                    <PaginationLink
                        isActive={i === page}
                        onClick={(e) => {
                            e.preventDefault();
                            onPageChange(i);
                        }}
                        className={cn(
                            "cursor-pointer",
                            linkClassName,
                            i === page && activeLinkClassName
                        )}
                    >
                        {i + 1}
                    </PaginationLink>
                </PaginationItem>
            );
        }
        if (Math.abs(i - page) === 2) {
            return (
                <PaginationItem key={i}>
                    <PaginationEllipsis className={linkClassName} />
                </PaginationItem>
            );
        }
        return null;
    });
}

export const SearchPaginationCompact = memo(function SearchPaginationCompact({
    page,
    totalPages,
    onPageChange,
}: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}) {
    if (totalPages <= 1) return null;

    return (
        <Pagination className="w-auto mx-0">
            <PaginationContent className="gap-0">
                <PageItems
                    page={page}
                    totalPages={totalPages}
                    onPageChange={onPageChange}
                    linkClassName="size-6 text-xs"
                    activeLinkClassName="font-semibold text-foreground border-none shadow-none"
                />
            </PaginationContent>
        </Pagination>
    );
});

export const SearchPaginationFull = memo(function SearchPaginationFull({
    page,
    totalPages,
    onPageChange,
}: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}) {
    if (totalPages <= 1) return null;

    return (
        <Pagination className="w-auto mx-0">
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        onClick={(e) => {
                            e.preventDefault();
                            onPageChange(page - 1);
                        }}
                        aria-disabled={page === 0}
                        className={
                            page === 0
                                ? "pointer-events-none opacity-50"
                                : "cursor-pointer"
                        }
                    />
                </PaginationItem>
                <PageItems
                    page={page}
                    totalPages={totalPages}
                    onPageChange={onPageChange}
                />
                <PaginationItem>
                    <PaginationNext
                        onClick={(e) => {
                            e.preventDefault();
                            onPageChange(page + 1);
                        }}
                        aria-disabled={page >= totalPages - 1}
                        className={
                            page >= totalPages - 1
                                ? "pointer-events-none opacity-50"
                                : "cursor-pointer"
                        }
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
});
