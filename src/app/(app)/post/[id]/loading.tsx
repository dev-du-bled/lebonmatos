import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="container px-6 sm:mx-auto my-10 min-h-screen transition-all space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* COLONNE GAUCHE */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Image avec overlay titre/prix */}
                    <div className="relative rounded-xl overflow-hidden bg-muted">
                        <Skeleton className="w-full aspect-4/3 rounded-xl" />
                        <div className="absolute bottom-0 left-0 right-0 p-6 pt-20 space-y-2">
                            <Skeleton className="h-8 w-2/3 bg-white/20" />
                            <Skeleton className="h-6 w-24 bg-white/20" />
                        </div>
                    </div>

                    {/* Vendeur */}
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-14 w-14 rounded-full shrink-0" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-5 w-36" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                        <Skeleton className="hidden sm:block h-9 w-28 rounded-md" />
                    </div>

                    {/* Description */}
                    <div className="py-4 space-y-4">
                        <Skeleton className="h-7 w-40" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-11/12" />
                            <Skeleton className="h-4 w-10/12" />
                            <Skeleton className="h-4 w-9/12" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-8/12" />
                        </div>
                    </div>

                    {/* Carte */}
                    <Skeleton className="w-full h-64 rounded-xl" />
                </div>

                {/* COLONNE DROITE (sidebar) */}
                <div className="space-y-6 sticky top-24">
                    {/* Boutons d'achat */}
                    <Card>
                        <CardContent className="space-y-3 pt-6">
                            <Skeleton className="h-11 w-full rounded-md" />
                            <Skeleton className="h-11 w-full rounded-md" />
                        </CardContent>
                    </Card>

                    {/* Spécifications */}
                    <Card>
                        <CardHeader className="pb-3 space-y-2">
                            <div className="flex items-center justify-between">
                                <Skeleton className="h-5 w-36" />
                                <Skeleton className="h-5 w-20 rounded-full" />
                            </div>
                            <Skeleton className="h-3 w-48" />
                        </CardHeader>
                        <CardContent className="p-0">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="flex justify-between px-6 py-3 border-t"
                                >
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-20" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Annonces similaires */}
            <div className="space-y-6 pt-8 border-t">
                <Skeleton className="h-7 w-64" />
                <div className="flex gap-4 overflow-hidden">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="shrink-0 basis-4/5 sm:basis-1/2 lg:basis-1/4 space-y-2">
                            <Skeleton className="w-full aspect-video rounded-lg" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
