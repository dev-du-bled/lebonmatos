import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

function ReviewCardSkeleton() {
    return (
        <Card className="p-5">
            <div className="flex items-start gap-4">
                <Skeleton className="size-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
            </div>
        </Card>
    );
}

export function ReviewsSkeleton() {
    return (
        <div className="grid gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
                <ReviewCardSkeleton key={i} />
            ))}
        </div>
    );
}
