import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { trpc } from "@/trpc/server";
import { getUser } from "@/utils/getUser";
import { getComponentSpecs, getEnumDisplay } from "@/utils/components";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PostCard from "@/components/post/suggested-post-card";
import { ContactButton, OfferButton } from "@/components/post/post-buttons";
import PostImageCarousel from "./post-image-carousel";
import { Metadata } from "next";
import { cache } from "react";
import PostMap from "@/components/post/post-map";
import FavoriteButton from "./favorite-button";
import { notFound } from "next/navigation";
import ReportButton from "@/components/report/report-button";
import Link from "next/link";
import { ReviewsDialog } from "@/app/(app)/user/[username]/reviews-dialog";

type Params = {
    id: string;
};

export async function generateMetadata({
    params,
}: {
    params: Promise<Params>;
}): Promise<Metadata> {
    const { id } = await params;

    const post = await getPost(id);

    if (!post) notFound();

    return {
        title: `Annonce "${post?.title.slice(0, 15)}${post?.title.length || 0 > 15 ? "..." : ""}"`,
        description: `Découvrez en détails l'annonce "${post?.title}"`,
    };
}

const getPost = cache(async (id: string) => {
    try {
        return await trpc.posts.getPost({ postId: id });
    } catch {
        return null;
    }
});

export default async function PostPage({
    params,
}: {
    params: Promise<Params>;
}) {
    const { id } = await params;

    const post = await getPost(id);

    if (!post) notFound();

    const currentUser = await getUser(false);
    const [sellerStats, sellerFirstPage] = post.seller?.id
        ? await Promise.all([
              trpc.user.getReviewStats({ userId: post.seller.id }),
              trpc.user.getReceivedReviews({
                  userId: post.seller.id,
                  limit: 10,
              }),
          ])
        : [
              { average: 0, count: 0 },
              { reviews: [], nextCursor: undefined },
          ];

    const similarPost = await trpc.posts.getSimilarPosts({
        id: post.id,
        type: post.component.type,
    });

    return (
        <div className="container mx-auto px-6 my-10 min-h-screen transition-all space-y-10">
            <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8 lg:items-start">
                {/* Image - mobile: 1er, desktop: col 1-2 row 1 */}
                <div className="lg:col-span-2 lg:col-start-1 lg:row-start-1 relative rounded-xl shadow-md overflow-hidden bg-muted">
                    <PostImageCarousel images={post.images} />
                    {/* Bouton favoris/report en haut à droite */}
                    <div className="absolute top-4 right-4 z-10 space-x-2">
                        <ReportButton
                            type="POST"
                            width="icon"
                            reportedId={post.id}
                            userId={post.seller?.id}
                            isSold={post.isSold}
                        />
                        <FavoriteButton
                            post={{
                                id: post.id,
                                isFavorited: post.isFavorited,
                                isSold: post.isSold,
                                seller: post.seller
                                    ? { id: post.seller.id }
                                    : undefined,
                            }}
                        />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 via-black/40 to-transparent p-6 pt-20">
                        <h1 className="text-2xl md:text-4xl font-bold text-white">
                            {post.title}
                        </h1>
                        <div className="flex items-center gap-3 mt-2">
                            <p className="text-2xl font-semibold text-primary">
                                {post.price} €
                            </p>
                            {post.isSold && (
                                <Badge variant="destructive">Vendu</Badge>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar (Vendeur + Actions + Specs) - mobile: 2e, desktop: col 3 sticky scrollable */}
                <div className="lg:col-start-3 lg:row-start-1 lg:row-span-4 space-y-6 lg:sticky lg:top-24">
                    {/* Vendeur */}
                    <Card className="gap-0">
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Link
                                    href={
                                        post.seller?.id === currentUser?.id
                                            ? "/profile"
                                            : post.seller?.username
                                              ? `/user/${post.seller.username}`
                                              : "#"
                                    }
                                    className="shrink-0"
                                >
                                    <Avatar className="h-14 w-14 border">
                                        {post.seller?.image ? (
                                            <AvatarImage
                                                src={post.seller.image}
                                                alt={`Avatar de ${post.seller.username ?? "vendeur"}`}
                                                className="object-cover"
                                            />
                                        ) : null}
                                        <AvatarFallback className="bg-muted text-lg">
                                            {(
                                                post.seller?.username ?? "?"
                                            ).charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                </Link>
                                <div className="min-w-0">
                                    <Link
                                        href={
                                            post.seller?.id === currentUser?.id
                                                ? "/profile"
                                                : post.seller?.username
                                                  ? `/user/${post.seller.username}`
                                                  : "#"
                                        }
                                        className="font-semibold text-lg hover:underline underline-offset-2"
                                    >
                                        {post.seller?.username ??
                                            "Utilisateur supprimé"}
                                    </Link>
                                    {post.seller && (
                                        <ReviewsDialog
                                            userId={post.seller.id}
                                            initialReviews={
                                                sellerFirstPage.reviews
                                            }
                                            initialNextCursor={
                                                sellerFirstPage.nextCursor
                                            }
                                            average={sellerStats.average}
                                            count={sellerStats.count}
                                            username={
                                                post.seller.username ??
                                                "Utilisateur"
                                            }
                                        />
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 pt-1">
                                <ContactButton
                                    postId={post.id}
                                    sellerId={post.seller?.id ?? ""}
                                    isSold={post.isSold}
                                    className="w-full"
                                />
                                <OfferButton
                                    postId={post.id}
                                    sellerId={post.seller?.id ?? ""}
                                    isSold={post.isSold}
                                    className="w-full"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Spécifications */}
                    <Card className="gap-0">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">
                                    Spécifications
                                </CardTitle>
                                <Badge variant="outline">
                                    {getEnumDisplay(post.component.type)}
                                </Badge>
                            </div>
                            <p className="text-xs font-mono text-muted-foreground line-clamp-1">
                                {post.component.name}
                            </p>
                        </CardHeader>
                        {getComponentSpecs(
                            post.component.type,
                            post.component.data
                        ).length > 0 ? (
                            <CardContent className="p-0 [&_[data-slot=table-container]]:overflow-hidden">
                                <Table className="table-fixed">
                                    <TableBody>
                                        {getComponentSpecs(
                                            post.component.type,
                                            post.component.data
                                        ).map((spec, index) => (
                                            <TableRow
                                                key={index}
                                                className="hover:bg-transparent"
                                            >
                                                <TableCell className="font-medium text-muted-foreground py-3 pl-6 w-2/5 whitespace-normal">
                                                    {spec.label}
                                                </TableCell>
                                                <TableCell className="py-3 pr-6 text-right whitespace-normal break-words">
                                                    {spec.value}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        ) : (
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Aucune spécification disponible.
                                </p>
                            </CardContent>
                        )}
                    </Card>
                </div>

                {/* Description - mobile: 3e, desktop: col 1-2 row 2 */}
                <div className="lg:col-span-2 lg:col-start-1 lg:row-start-2">
                    <h2 className="text-2xl font-semibold mb-2">Description</h2>
                    <p className="text-base leading-relaxed text-muted-foreground whitespace-pre-line">
                        {post.description}
                    </p>
                </div>

                {/* Carte - mobile: 4e, desktop: col 1-2 row 3 */}
                <div className="lg:col-span-2 lg:col-start-1 lg:row-start-3">
                    <PostMap location={post.location} />
                </div>
            </div>

            {/* Annonces similaires */}
            {similarPost.length > 0 && (
                <div className="space-y-6 pt-8 border-t">
                    <h2 className="text-2xl font-semibold">
                        Plus comme &quot;{post.title}&quot;
                    </h2>
                    <Carousel className="w-full">
                        <CarouselContent className="-ml-4">
                            {similarPost.map(
                                (p: (typeof similarPost)[number]) => (
                                    <CarouselItem
                                        key={p.id}
                                        className="pl-4 basis-4/5 sm:basis-1/2 lg:basis-1/4"
                                    >
                                        <PostCard {...p} />
                                    </CarouselItem>
                                )
                            )}
                        </CarouselContent>
                        <CarouselPrevious className="-left-4" />
                        <CarouselNext className="-right-4" />
                    </Carousel>
                </div>
            )}
        </div>
    );
}
