import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function ProfileEditFormSkeleton() {
    return (
        <Card className="shadow-lg">
            <CardHeader>
                <Skeleton className="h-7 w-36 mb-1" />
                <Skeleton className="h-4 w-80" />
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-9 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-9 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-9 w-full" />
                    </div>
                </div>
                <div className="flex justify-between">
                    <Skeleton className="h-9 w-48" />
                    <Skeleton className="h-9 w-28" />
                </div>
            </CardContent>
        </Card>
    );
}
