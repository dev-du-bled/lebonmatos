"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { trpc } from "@/trpc/client";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ListingCardProps {
    listing: {
        id: string;
        title: string;
        description: string | null;
        price: number;
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
    const deletePost = trpc.posts.deletePost.useMutation({
        onSuccess: () => {
            setIsDeleteDialogOpen(false);
            router.refresh();
        },
    });

    const handleDelete = () => {
        deletePost.mutate({ id: listing.id });
    };

    return (
        <Card className="overflow-hidden transition hover:border-primary hover:shadow-md p-0 gap-0">
            <div className="flex flex-col sm:flex-row">
                <Link
                    href={`/post/${listing.id}`}
                    className="relative h-40 w-full bg-secondary sm:h-auto sm:w-48 shrink-0"
                >
                    <Image
                        src={
                            listing.thumbnail?.image || "/images/fallback.webp"
                        }
                        alt={listing.thumbnail?.alt ?? listing.title}
                        fill
                        className="h-full w-full object-cover"
                    />
                </Link>
                <div className="flex flex-1 flex-col justify-between p-4 gap-4">
                    <Link href={`/post/${listing.id}`} className="space-y-1">
                        <div className="flex justify-between items-start gap-2">
                            <CardTitle className="text-base line-clamp-1">
                                {listing.title}
                            </CardTitle>
                            <span className="text-lg font-bold dark:text-primary shrink-0">
                                {listing.price.toLocaleString("fr-FR")} €
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {listing.component.name}
                        </p>
                        {listing.description && (
                            <CardDescription className="line-clamp-2 text-sm">
                                {listing.description}
                            </CardDescription>
                        )}
                    </Link>

                    <div className="flex items-center justify-end gap-2">
                        <Link
                            href={`/create-post?edit=${listing.id}`}
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

                        <Dialog
                            open={isDeleteDialogOpen}
                            onOpenChange={setIsDeleteDialogOpen}
                        >
                            <DialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                    <Trash2 className="size-3 mr-1" />
                                    Supprimer
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        Supprimer l&apos;annonce ?
                                    </DialogTitle>
                                    <DialogDescription>
                                        Cette action est irréversible. Cela
                                        supprimera définitivement votre annonce
                                        &quot;{listing.title}&quot;.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button variant="outline">
                                            Annuler
                                        </Button>
                                    </DialogClose>
                                    <Button
                                        variant="destructive"
                                        onClick={handleDelete}
                                        loading={deletePost.isPending}
                                    >
                                        Supprimer
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>
        </Card>
    );
}
