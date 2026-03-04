import { memo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchResultItem, type SearchHit } from "./search-result-item";

function SearchResultsSkeleton() {
    return (
        <>
            {Array.from({ length: 5 }).map((_, i) => (
                <div
                    key={i}
                    className="flex items-center gap-4 border rounded-lg overflow-hidden my-1.5"
                >
                    <Skeleton className="w-28 min-h-24 sm:w-44 sm:min-h-32 self-stretch shrink-0 rounded-none" />
                    <div className="flex-1 py-3 flex flex-col gap-2">
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-4 w-16 sm:hidden" />
                        <Skeleton className="h-3 w-24 mt-1" />
                    </div>
                    <div className="hidden sm:flex flex-col items-end gap-2 mr-4">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-7 w-7 rounded-md" />
                    </div>
                </div>
            ))}
        </>
    );
}

export const SearchResultsList = memo(function SearchResultsList({
    results,
    isLoading,
}: {
    results: SearchHit[];
    isLoading: boolean;
}) {
    return (
        <div className="flex flex-col">
            {isLoading ? (
                <SearchResultsSkeleton />
            ) : (
                results.map((post) => (
                    <SearchResultItem key={post.id} post={post} />
                ))
            )}
        </div>
    );
});
