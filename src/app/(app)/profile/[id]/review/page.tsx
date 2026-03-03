import { cache } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Metadata } from "next";

import { trpc } from "@/trpc/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
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
    searchParams,
}: {
    params: Promise<Params>;
    searchParams: Promise<{ from?: string }>;
}) {
    const { id } = await params;
    const { from } = await searchParams;
    const backHref = from ?? `/profile/${id}`;
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
        <section className="mx-auto w-full max-w-lg px-4 pb-16 pt-10 sm:px-6">
            {/* Header */}
            <div className="mb-8 flex items-center gap-3">
                <Link
                    href={backHref}
                    className={cn(buttonVariants({ variant: "outline", size: "icon" }), "shrink-0 rounded-full")}
                >
                    <ArrowLeft className="size-4" />
                </Link>
                <div>
                    <h1 className="text-xl font-semibold tracking-tight">Laisser un avis</h1>
                    <p className="text-sm text-muted-foreground">Partagez votre expérience avec ce vendeur</p>
                </div>
            </div>

            {/* Target user recap */}
            <div className="mb-5 flex items-center gap-4 rounded-2xl border bg-muted/40 px-5 py-4">
                <Avatar className="size-11 shrink-0 ring-2 ring-background shadow-sm">
                    {user.image ? (
                        <AvatarImage src={user.image} alt={`Avatar de ${displayName}`} className="object-cover" />
                    ) : null}
                    <AvatarFallback className="bg-secondary text-muted-foreground font-medium">
                        {initials}
                    </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                    <p className="font-semibold truncate">{displayName}</p>
                    {user.bio ? (
                        <p className="text-sm text-muted-foreground line-clamp-1">{user.bio}</p>
                    ) : (
                        <p className="text-sm text-muted-foreground">Membre LeBonMatos</p>
                    )}
                </div>
            </div>

            {/* Form card */}
            <Card className="shadow-sm">
                <CardHeader className="pb-4">
                    <CardTitle className="text-base">Votre avis</CardTitle>
                    <CardDescription>
                        Votre avis sera public et visible sur le profil de cet utilisateur.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ReviewForm userId={user.id} backHref={backHref} />
                </CardContent>
            </Card>
        </section>
    );
}
