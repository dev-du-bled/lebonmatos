import { Skeleton } from "@/components/ui/skeleton";

function ReportCardSkeleton() {
    return (
        <div className="flex overflow-hidden rounded-xl border bg-card shadow-sm">
            <div className="flex flex-1 flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex gap-2">
                        <Skeleton className="h-5 w-20 rounded-full" />
                        <Skeleton className="h-5 w-16 rounded-full" />
                        <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-24 shrink-0" />
                </div>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </div>
        </div>
    );
}

export function ReportsSkeleton() {
    return (
        <div className="grid gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <ReportCardSkeleton key={i} />
            ))}
        </div>
    );
}
