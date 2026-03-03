"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BadgeCheck, EllipsisVertical, Pencil, Trash2 } from "lucide-react";
import { trpc } from "@/trpc/client";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ListingCardProps {
    listing: {
        id: string;
        title: string;
        description: string | null;
        price: number;
        isSold: boolean;
        component: {
            id: string;
            name: string;
            type: string;
        };
        thumbnail: {
            id: string;
            image: string;
            alt: string | null;
        } | null;
    };
}

export function ListingCard({ listing }: ListingCardProps) {
    const router = useRouter();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isSoldDialogOpen, setIsSoldDialogOpen] = useState(false);

    const deletePost = trpc.posts.deletePost.useMutation({
        onSuccess: () => {
            setIsDeleteDialogOpen(false);
            router.refresh();
        },
    });

    const markAsSold = trpc.posts.markAsSold.useMutation({
        onSuccess: () => {
            setIsSoldDialogOpen(false);
            router.refresh();
        },
    });

    return (
        <>
            <Card
                className={cn(
                    "overflow-hidden transition hover:border-primary hover:shadow-md p-0 gap-0",
                    listing.isSold &&
                        "opacity-60 hover:border-border hover:shadow-none"
                )}
            >
                <div className="flex flex-col sm:flex-row">
                    <div className="relative h-40 w-full bg-secondary sm:h-auto sm:w-48 shrink-0">
                        <Link href={`/post/${listing.id}`}>
                            <Image
                                src={
                                    listing.thumbnail?.image ||
                                    "/images/fallback.webp"
                                }
                                alt={listing.thumbnail?.alt ?? listing.title}
                                fill
                                className={cn(
                                    "h-full w-full object-cover",
                                    listing.isSold && "grayscale"
                                )}
                            />
                        </Link>
                        {listing.isSold && (
                            <div className="absolute inset-0 flex items-center justify-center bg-background/30 pointer-events-none">
                                <Badge
                                    variant="secondary"
                                    className="text-xs font-semibold shadow"
                                >
                                    Vendu
                                </Badge>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-1 flex-col justify-between p-4 gap-4">
                        <div className="flex items-start gap-2">
                            <Link href={`/post/${listing.id}`} className="space-y-1 flex-1 min-w-0">
                                <CardTitle className="text-base line-clamp-1">
                                    {listing.title}
                                </CardTitle>
                                <p className="text-xs text-muted-foreground">
                                    {listing.component.name}
                                </p>
                                {listing.description && (
                                    <CardDescription className="line-clamp-2 text-sm">
                                        {listing.description}
                                    </CardDescription>
                                )}
                            </Link>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-8 shrink-0"
                                    >
                                        <EllipsisVertical className="size-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href={`/create-post?edit=${listing.id}`}
                                        >
                                            <Pencil className="size-4" />
                                            Modifier
                                        </Link>
                                    </DropdownMenuItem>
                                    {!listing.isSold && (
                                        <DropdownMenuItem
                                            onSelect={() =>
                                                setIsSoldDialogOpen(true)
                                            }
                                        >
                                            <BadgeCheck className="size-4" />
                                            Marquer comme vendu
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        variant="destructive"
                                        onSelect={() =>
                                            setIsDeleteDialogOpen(true)
                                        }
                                    >
                                        <Trash2 className="size-4" />
                                        Supprimer
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <div className="flex items-center justify-end">
                            <span
                                className={cn(
                                    "text-lg font-bold shrink-0",
                                    listing.isSold
                                        ? "text-muted-foreground line-through"
                                        : "dark:text-primary"
                                )}
                            >
                                {listing.price.toLocaleString("fr-FR")} €
                            </span>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Dialog de confirmation suppression */}
            <Dialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Supprimer l&apos;annonce ?</DialogTitle>
                        <DialogDescription>
                            Cette action est irréversible. Cela supprimera
                            définitivement votre annonce &quot;{listing.title}
                            &quot;.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Annuler</Button>
                        </DialogClose>
                        <Button
                            variant="destructive"
                            onClick={() =>
                                deletePost.mutate({ id: listing.id })
                            }
                            loading={deletePost.isPending}
                        >
                            Supprimer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog de confirmation vendu */}
            <Dialog
                open={isSoldDialogOpen}
                onOpenChange={setIsSoldDialogOpen}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Marquer comme vendu ?
                        </DialogTitle>
                        <DialogDescription>
                            Cette action est irréversible. Votre annonce
                            &quot;{listing.title}&quot; sera marquée comme
                            vendue.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Annuler</Button>
                        </DialogClose>
                        <Button
                            onClick={() =>
                                markAsSold.mutate({ id: listing.id })
                            }
                            loading={markAsSold.isPending}
                        >
                            Confirmer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
