import { memo, ReactNode } from "react";
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
    if (totalPages <= 0) {
        return null;
    }

    // Only render a few of pages, not need to parse through the entire page window
    // as we'll not show all of it
    // - first page (0)
    // - last page (totalPages - 1)
    // - a small window around the current page (page - 1, page, page + 1)
    const pagesToShow = new Set<number>();
    pagesToShow.add(0);
    if (totalPages > 1) {
        pagesToShow.add(totalPages - 1);
    }
    for (let offset = -1; offset <= 1; offset++) {
        const candidate = page + offset;
        if (candidate > 0 && candidate < totalPages - 1) {
            pagesToShow.add(candidate);
        }
    }

    const sortedPages = Array.from(pagesToShow).sort((a, b) => a - b);
    const items: ReactNode[] = [];
    let previousPage: number | null = null;

    for (const currentPage of sortedPages) {
        if (previousPage !== null && currentPage - previousPage > 1) {
            items.push(
                <PaginationItem key={`ellipsis-${currentPage}`}>
                    <PaginationEllipsis className={linkClassName} />
                </PaginationItem>
            );
        }
        items.push(
            <PaginationItem key={currentPage}>
                <PaginationLink
                    isActive={currentPage === page}
                    onClick={(e) => {
                        e.preventDefault();
                        onPageChange(currentPage);
                    }}
                    className={cn(
                        "cursor-pointer",
                        linkClassName,
                        currentPage === page && activeLinkClassName
                    )}
                >
                    {currentPage + 1}
                </PaginationLink>
            </PaginationItem>
        );
        previousPage = currentPage;
    }

    return items;
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
                            if (page === 0) return;
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
                            if (page >= totalPages - 1) return;
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
