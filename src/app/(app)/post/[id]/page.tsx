import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MessageSquare } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { trpc } from "@/trpc/server";
import { getUser } from "@/utils/getUser";
import { getComponentSpecs, getEnumDisplay } from "@/utils/components";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import PostCard from "@/components/post/post-card";
import { BuyButtons, ContactButton } from "@/components/post/post-buttons";
import { Metadata } from "next";
import { cache } from "react";
import PostMap from "@/components/post/post-map";
import FavoriteButton from "./favorite-button";
import { notFound } from "next/navigation";
import z from "zod";
import Link from "next/link";
import { ReviewsDialog } from "@/app/(app)/profile/[id]/reviews-dialog";

type Params = {
    id: string;
};

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
    const { id } = await params;

    const post = await getPost(id);

    return {
        title: `Annonce "${post?.title.slice(0, 15)}${post?.title.length || 0 > 15 ? "..." : ""}"`,
        description: `Découvrez en détails l'annonce "${post?.title}"`,
    };
}

const getPost = cache(async (id: string) => {
    const post = await trpc.posts.getPost({ postId: id });
    return post;
});

export default async function PostPage({ params }: { params: Promise<Params> }) {
    const { id } = await params;

    if (!z.cuid().safeParse(id).success) notFound();

    const post = await getPost(id);

    if (!post) notFound();

    const currentUser = await getUser(false);
    const sellerReviews = post.seller?.id ? await trpc.user.getReceivedReviews({ userId: post.seller.id }) : [];
    const sellerAverage =
        sellerReviews.length > 0
            ? sellerReviews.reduce((sum: number, r: (typeof sellerReviews)[number]) => sum + r.rating, 0) /
              sellerReviews.length
            : 0;

    const similarPost = await trpc.posts.getSimilarPosts({
        id: post.id,
        type: post.component.type,
    });

    return (
        <div className="container mx-auto px-6 my-10 min-h-screen transition-all space-y-10">
            <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8 lg:items-start">
                {/* Image - mobile: 1er, desktop: col 1-2 row 1 */}
                <div className="lg:col-span-2 lg:col-start-1 lg:row-start-1 relative rounded-xl shadow-md overflow-hidden bg-muted">
                    <Carousel className="w-full relative">
                        <CarouselContent className="ml-0">
                            {(post.images.length > 0 ? post.images : ["/images/fallback.webp"]).map(
                                (image: string, index: number) => (
                                    <CarouselItem key={index} className="pl-0">
                                        <AspectRatio ratio={4 / 3}>
                                            <Image
                                                src={image || "/images/fallback.webp"}
                                                alt={`Image ${index + 1}`}
                                                fill
                                                className="object-cover"
                                            />
                                        </AspectRatio>
                                    </CarouselItem>
                                )
                            )}
                        </CarouselContent>
                        <CarouselPrevious className="left-4" />
                        <CarouselNext className="right-4" />
                    </Carousel>
                    {/* Bouton favoris en haut à droite */}
                    <div className="absolute top-4 right-4 z-10">
                        <FavoriteButton
                            post={{
                                id: post.id,
                                isFavorited: post.isFavorited,
                            }}
                        />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 via-black/40 to-transparent p-6 pt-20 pointer-events-none">
                        <h1 className="text-2xl md:text-4xl font-bold text-white">{post.title}</h1>
                        <p className="text-2xl font-semibold text-primary mt-2">{post.price} €</p>
                    </div>
                </div>

                {/* Sidebar (Actions + Specs) - mobile: 2e, desktop: col 3 rows 1-4 sticky */}
                <div className="lg:col-start-3 lg:row-start-1 lg:row-span-4 space-y-6 lg:sticky lg:top-24">
                    {/* Actions */}
                    <BuyButtons postId={post.id} price={post.price} isSold={post.isSold} />

                    {/* Spécifications */}
                    <Card className="gap-0">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">Spécifications</CardTitle>
                                <Badge variant="outline">{getEnumDisplay(post.component.type)}</Badge>
                            </div>
                            <p className="text-xs font-mono text-muted-foreground line-clamp-1">
                                {post.component.name}
                            </p>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableBody>
                                    {getComponentSpecs(post.component.type, post.component.data).map((spec, index) => (
                                        <TableRow key={index} className="hover:bg-transparent">
                                            <TableCell className="font-medium text-muted-foreground py-3 pl-6 w-1/2">
                                                {spec.label}
                                            </TableCell>
                                            <TableCell className="py-3 pr-6 text-right">{spec.value}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                {/* Vendeur - mobile: 3e, desktop: col 1-2 row 2 */}
                <div className="lg:col-span-2 lg:col-start-1 lg:row-start-2 flex items-center justify-between gap-4">
                    {/* Infos vendeur */}
                    <div className="flex items-center gap-3 min-w-0">
                        <Link
                            href={post.seller?.id === currentUser?.id ? "/profile" : `/profile/${post.seller?.id}`}
                            className="shrink-0"
                        >
                            <Avatar className="h-14 w-14 border">
                                <AvatarImage src="" />
                                <AvatarFallback className="bg-muted text-lg">
                                    {(post.seller?.username ?? "?").charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                        </Link>
                        <div className="min-w-0">
                            <Link
                                href={post.seller?.id === currentUser?.id ? "/profile" : `/profile/${post.seller?.id}`}
                                className="font-semibold text-lg hover:underline underline-offset-2"
                            >
                                {post.seller?.username ?? "Utilisateur supprimé"}
                            </Link>
                            {post.seller && (
                                <ReviewsDialog
                                    reviews={sellerReviews}
                                    average={sellerAverage}
                                    username={post.seller.username ?? "Utilisateur"}
                                />
                            )}
                        </div>
                    </div>

                    {/* Actions à droite */}
                    <div className="flex items-center gap-2 shrink-0">
                        {post.canLeaveReview && post.seller?.id && (
                            <Link
                                href={`/profile/${post.seller.id}/review`}
                                className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
                            >
                                <MessageSquare className="size-4" />
                                <span className="hidden sm:inline">Laisser un avis</span>
                            </Link>
                        )}
                        <ContactButton />
                    </div>
                </div>

                {/* Description - mobile: 4e, desktop: col 1-2 row 3 */}
                <div className="lg:col-span-2 lg:col-start-1 lg:row-start-4 py-4">
                    <h2 className="text-2xl font-semibold mb-4">Description</h2>
                    <p className="text-base leading-relaxed text-muted-foreground whitespace-pre-line">
                        {post.description}
                    </p>
                </div>

                {/* Carte - mobile: 5e (sous specs), desktop: col 1-2 row 5 */}
                <div className="lg:col-span-2 lg:col-start-1 lg:row-start-5">
                    <PostMap location={post.location} />
                </div>
            </div>

            {/* Annonces similaires */}
            {similarPost.length > 0 && (
                <div className="space-y-6 pt-8 border-t">
                    <h2 className="text-2xl font-semibold">Plus comme &quot;{post.title}&quot;</h2>
                    <Carousel className="w-full">
                        <CarouselContent className="-ml-4">
                            {similarPost.map((p: (typeof similarPost)[number]) => (
                                <CarouselItem key={p.id} className="pl-4 basis-4/5 sm:basis-1/2 lg:basis-1/4">
                                    <PostCard {...p} />
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="-left-4" />
                        <CarouselNext className="-right-4" />
                    </Carousel>
                </div>
            )}
        </div>
    );
}
