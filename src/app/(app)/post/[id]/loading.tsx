import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="container px-6 sm:mx-auto my-14 min-h-screen transition-all space-y-4">
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex flex-col flex-1">
                    <div className="relative w-full max-h-96">
                        <Skeleton className="h-96 w-full aspect-square rounded-lg" />
                    </div>
                </div>

                <div className="flex flex-col gap-2 flex-1">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-6 w-24" />
                    <div className="space-y-2 pr-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-11/12" />
                        <Skeleton className="h-4 w-10/12" />
                        <Skeleton className="h-4 w-9/12" />
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex flex-col gap-8 flex-1">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                        <div className="ml-auto flex items-center gap-2">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-4 rounded-full" />
                        </div>
                    </div>

                    <Card className="gap-0">
                        <CardHeader>
                            <CardTitle className="text-xl">
                                <Skeleton className="h-6 w-40" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Skeleton className="h-4 w-5/6" />
                            <Skeleton className="h-4 w-4/6" />
                            <Skeleton className="h-4 w-3/6" />
                            <Skeleton className="h-4 w-5/6" />
                        </CardContent>
                    </Card>
                </div>

                <div className="flex flex-col gap-8 flex-1">
                    <Card className="gap-0">
                        <CardHeader>
                            <CardTitle>
                                <Skeleton className="h-6 w-56" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-200 overflow-auto">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="border rounded-lg overflow-hidden relative"
                                    >
                                        <Skeleton className="w-full h-48" />
                                        <div className="p-4 space-y-2">
                                            <Skeleton className="h-4 w-3/4" />
                                            <Skeleton className="h-4 w-1/3" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
