import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ProfileEditLoading() {
    return (
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 pb-16 pt-10 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-semibold sm:text-4xl">
                    Informations personnelles
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base">
                    Gérez vos informations privées et vos coordonnées de
                    contact.
                </p>
            </div>
            <Card className="shadow-lg">
                <CardHeader>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-5 w-full max-w-md" />
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="flex justify-end gap-3">
                        <Skeleton className="h-10 w-32" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
