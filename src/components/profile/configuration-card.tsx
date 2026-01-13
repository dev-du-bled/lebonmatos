"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Pencil, Trash2, HardDrive, Cpu } from "lucide-react";
import { toast } from "sonner";
import { inferRouterOutputs } from "@trpc/server";

import { Card, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/trpc/client";
import { AppRouter } from "@/trpc/routers/_app";
import { cn } from "@/lib/utils";

type RouterOutputs = inferRouterOutputs<AppRouter>;
type Configuration = RouterOutputs["configuration"]["list"][number];

interface ConfigurationCardProps {
    configuration: Configuration;
}

export function ConfigurationCard({ configuration }: ConfigurationCardProps) {
    const router = useRouter();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const deleteMutation = trpc.configuration.delete.useMutation({
        onSuccess: () => {
            toast.success("Configuration supprimée");
            router.refresh();
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la suppression");
        },
    });

    const handleDelete = () => {
        deleteMutation.mutate({ id: configuration.id });
    };

    return (
        <Card className="overflow-hidden transition hover:border-primary hover:shadow-md p-0 gap-0">
            <div className="flex flex-col sm:flex-row">
                <Link
                    href={`/configurator?id=${configuration.id}`}
                    className="relative h-40 w-full bg-secondary sm:h-auto sm:w-48 shrink-0 flex items-center justify-center"
                >
                    <Cpu className="size-12 text-muted-foreground/50" />
                </Link>
                <div className="flex flex-1 flex-col justify-between p-4 gap-4">
                    <Link
                        href={`/configurator?id=${configuration.id}`}
                        className="space-y-1"
                    >
                        <div className="flex justify-between items-start gap-2">
                            <CardTitle className="text-base line-clamp-1">
                                {configuration.name}
                            </CardTitle>
                            <span className="text-lg font-bold text-primary shrink-0">
                                {configuration.totalPrice} €
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span>
                                Modifié le{" "}
                                {format(
                                    new Date(configuration.updatedAt),
                                    "d MMM yyyy",
                                    {
                                        locale: fr,
                                    }
                                )}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                <HardDrive className="size-3" />{" "}
                                {configuration.itemCount} composants
                            </span>
                        </div>
                        <div className="pt-1">
                            {configuration.isPublic ? (
                                <Badge
                                    variant="secondary"
                                    className="text-[10px] px-1.5 h-5"
                                >
                                    Publique
                                </Badge>
                            ) : (
                                <Badge
                                    variant="outline"
                                    className="text-[10px] px-1.5 h-5"
                                >
                                    Privée
                                </Badge>
                            )}
                        </div>
                    </Link>

                    <div className="flex items-center justify-end gap-2">
                        <Link
                            href={`/configurator?id=${configuration.id}`}
                            className={cn(
                                buttonVariants({
                                    variant: "outline",
                                    size: "sm",
                                })
                            )}
                        >
                            <Pencil className="size-3 mr-1" />
                            Modifier
                        </Link>

                        <AlertDialog
                            open={deleteDialogOpen}
                            onOpenChange={setDeleteDialogOpen}
                        >
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                    <Trash2 className="size-3 mr-1" />
                                    Supprimer
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        Êtes-vous sûr ?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Cette action est irréversible. La
                                        configuration &quot;
                                        {configuration.name}&quot; sera
                                        définitivement supprimée.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>
                                        Annuler
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleDelete}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                        {deleteMutation.isPending
                                            ? "Suppression..."
                                            : "Supprimer"}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            </div>
        </Card>
    );
}
