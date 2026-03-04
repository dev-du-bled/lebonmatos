import { Suspense } from "react";
import Link from "next/link";
import { Cpu, Plus } from "lucide-react";
import { trpc } from "@/trpc/server";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ConfigurationCard } from "@/components/profile/configuration-card";
import { Card, CardContent } from "@/components/ui/card";
import { Metadata } from "next";
import NavBack from "@/components/nav/nav-back";

export const metadata: Metadata = {
    title: "Mes configurations",
    description: "Gérez vos configurations PC enregistrées",
};

function ConfigurationCardSkeleton() {
    return (
        <Card className="overflow-hidden p-0 gap-0">
            <div className="flex flex-col sm:flex-row">
                <Skeleton className="h-40 w-full sm:h-auto sm:w-48 shrink-0 rounded-none aspect-square sm:aspect-auto" />
                <CardContent className="flex flex-1 flex-col justify-between gap-4 p-4">
                    <div className="space-y-2">
                        <div className="flex justify-between items-start gap-2">
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-6 w-20 shrink-0" />
                        </div>
                        <Skeleton className="h-3 w-1/3" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>
                    <div className="flex items-center justify-end gap-2">
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-8 w-24" />
                    </div>
                </CardContent>
            </div>
        </Card>
    );
}

function ConfigurationsSkeleton() {
    return (
        <div className="grid gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
                <ConfigurationCardSkeleton key={i} />
            ))}
        </div>
    );
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center gap-6 py-16 text-center">
            <div className="flex size-20 items-center justify-center rounded-full bg-secondary">
                <Cpu className="size-10 text-muted-foreground" />
            </div>
            <div className="space-y-2">
                <h2 className="text-xl font-semibold">Aucune configuration</h2>
                <p className="max-w-sm text-muted-foreground">
                    Vous n&apos;avez pas encore créé de configuration. Commencez
                    à créer votre PC de rêve dès maintenant !
                </p>
            </div>
            <Link
                href="/configurator"
                className={cn(buttonVariants({ size: "lg" }))}
            >
                <Plus className="size-4" />
                Créer une configuration
            </Link>
        </div>
    );
}

async function ConfigurationsContent() {
    const configurations = await trpc.configuration.list();

    if (configurations.length === 0) {
        return <EmptyState />;
    }

    // Serialize dates for Client Component
    const serializedConfigurations = configurations.map((config) => ({
        ...config,
        createdAt: config.createdAt.toISOString(),
        updatedAt: config.updatedAt.toISOString(),
    }));

    return (
        <div className="grid gap-4">
            {serializedConfigurations.map((config) => (
                <ConfigurationCard key={config.id} configuration={config} />
            ))}
        </div>
    );
}

async function HeaderAction() {
    const configurations = await trpc.configuration.list();

    if (configurations.length === 0) {
        return null;
    }

    return (
        <Link href="/configurator" className={cn(buttonVariants())}>
            <Plus className="size-4" />
            Nouvelle config
        </Link>
    );
}

export default function ConfigurationsPage() {
    return (
        <section className="mx-auto w-full max-w-4xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
            <NavBack
                href="/profile"
                title="Mes configurations"
                desc="Gérez vos configurations PC enregistrées"
            >
                <Suspense fallback={<Skeleton className="h-9 w-40" />}>
                    <HeaderAction />
                </Suspense>
            </NavBack>

            <Suspense fallback={<ConfigurationsSkeleton />}>
                <ConfigurationsContent />
            </Suspense>
        </section>
    );
}
