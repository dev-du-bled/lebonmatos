import { cache } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Metadata } from "next";

import { trpc } from "@/trpc/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ReviewForm } from "./review-form";

type Params = { id: string };

const getUser = cache(async (id: string) => {
    try {
        return await trpc.user.getPublicProfile({ userId: id });
    } catch {
        return null;
    }
});

export async function generateMetadata({
    params,
}: {
    params: Promise<Params>;
}): Promise<Metadata> {
    const { id } = await params;
    const user = await getUser(id);
    const name = user?.username ?? "cet utilisateur";
    return {
        title: `Laisser un avis pour ${name}`,
        description: `Partagez votre expérience avec ${name}`,
    };
}

export default async function ReviewPage({
    params,
}: {
    params: Promise<Params>;
}) {
    const { id } = await params;
    const user = await getUser(id);

    if (!user) return notFound();

    const displayName = user.username ?? "Utilisateur supprimé";
    const initials = displayName
        .split(/\s+/)
        .map((s) => s[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase();

    return (
        <section className="mx-auto w-full max-w-xl px-4 pb-16 pt-10 sm:px-6">
            <div className="mb-8 flex items-center gap-4">
                <Link
                    href={`/profile/${id}`}
                    className={cn(
                        buttonVariants({ variant: "ghost", size: "icon" })
                    )}
                >
                    <ArrowLeft className="size-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-semibold">Laisser un avis</h1>
                    <p className="text-sm text-muted-foreground">
                        Partagez votre expérience avec ce vendeur
                    </p>
                </div>
            </div>

            {/* Target user recap */}
            <div className="mb-6 flex items-center gap-4 rounded-xl border bg-secondary/40 px-5 py-4">
                <Avatar className="size-12 shrink-0">
                    {user.image ? (
                        <AvatarImage
                            src={user.image}
                            alt={`Avatar de ${displayName}`}
                            className="object-cover"
                        />
                    ) : null}
                    <AvatarFallback className="bg-secondary text-muted-foreground">
                        {initials}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold">{displayName}</p>
                    {user.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                            {user.bio}
                        </p>
                    )}
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Votre avis</CardTitle>
                    <CardDescription>
                        Votre avis est public et visible sur le profil de cet
                        utilisateur.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ReviewForm userId={user.id} />
                </CardContent>
            </Card>
        </section>
    );
}
