import { cache } from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";

import { trpc } from "@/trpc/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { ReviewForm } from "./review-form";
import NavBack from "@/components/nav/nav-back";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag } from "lucide-react";

type Params = { username: string };
type SearchParams = { from?: string; postId?: string };

const getUser = cache(async (username: string) => {
    try {
        return await trpc.user.getPublicProfileByUsername({ username });
    } catch {
        return null;
    }
});

const getPost = cache(async (postId: string) => {
    try {
        return await trpc.posts.getPost({ postId });
    } catch {
        return null;
    }
});

export async function generateMetadata({
    params,
}: {
    params: Promise<Params>;
}): Promise<Metadata> {
    const { username } = await params;
    const user = await getUser(username);
    const name = user?.displayUsername ?? user?.username ?? "cet utilisateur";
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
    searchParams: Promise<SearchParams>;
}) {
    const { username } = await params;
    const { from, postId } = await searchParams;
    const user = await getUser(username);

    if (!user) return notFound();
    if (!postId) return notFound();

    const post = await getPost(postId);
    if (!post) return notFound();

    const backHref = from ?? `/user/${user.username ?? username}`;

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
            <NavBack
                href={backHref}
                title="Laisser un avis"
                desc="Partagez votre expérience"
            />

            {/* Vendeur */}
            <div className="mb-4 flex items-center gap-4 rounded-2xl border bg-muted/40 px-5 py-4">
                <Avatar className="size-11 shrink-0 ring-2 ring-background shadow-sm">
                    {user.image ? (
                        <AvatarImage
                            src={user.image}
                            alt={`Avatar de ${displayName}`}
                            className="object-cover"
                        />
                    ) : null}
                    <AvatarFallback className="bg-secondary text-muted-foreground font-medium">
                        {initials}
                    </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                    <p className="font-semibold truncate">{displayName}</p>
                    {user.bio ? (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                            {user.bio}
                        </p>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            Membre LeBonMatos
                        </p>
                    )}
                </div>
            </div>

            {/* Annonce concernée */}
            <div className="mb-5 flex items-center gap-3 rounded-xl border bg-muted/20 px-4 py-3">
                <ShoppingBag className="size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground mb-0.5">
                        Avis pour l&apos;annonce
                    </p>
                    <p className="text-sm font-medium truncate">{post.title}</p>
                </div>
                <Badge variant="secondary" className="shrink-0">
                    {post.price} €
                </Badge>
            </div>

            {/* Formulaire */}
            <Card className="shadow-sm">
                <CardHeader className="pb-4">
                    <CardTitle className="text-base">Votre avis</CardTitle>
                    <CardDescription>
                        Votre avis sera public et visible sur le profil de ce
                        vendeur.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ReviewForm postId={postId} backHref={backHref} />
                </CardContent>
            </Card>
        </section>
    );
}
