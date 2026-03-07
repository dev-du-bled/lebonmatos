import { Skeleton } from "@/components/ui/skeleton";

export function ProfileHeaderSkeleton() {
    return (
        <div className="flex flex-col items-center gap-6 text-center md:flex-row md:items-center md:justify-between md:text-left">
            <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
                <Skeleton className="size-24 rounded-full" />
                <div className="space-y-2">
                    <div className="space-y-1">
                        <Skeleton className="h-8 w-40" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-4 w-64" />
                    <div className="flex items-center justify-center gap-2 md:justify-start">
                        <Skeleton className="h-4 w-20" />
                    </div>
                </div>
            </div>
            <Skeleton className="h-10 w-32" />
        </div>
    );
}
