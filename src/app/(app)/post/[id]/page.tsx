import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { trpc } from "@/trpc/server";
import { Components, formatComponentData } from "@/utils/components";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { Star } from "lucide-react";
import PostCard from "@/components/post/post-card";
import { BuyButtons, ContactButton } from "@/components/post/post-buttons";
import { getUser } from "@/utils/getUser";
import { Metadata } from "next";
import { cache } from "react";

type Params = {
    id: string;
};

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
    const { id } = await params;

    const post = await getPost(id);

    return {
        title: `Annonce "${post.title}"`,
        description: `Découvrez en détails l'annonce "${post.title}"`,
    };
}

const getPost = cache(async (id: string) => {
    const post = await trpc.posts.getPost({ postId: id });
    return post;
});

export default async function PostPage({ params }: { params: Promise<Params> }) {
    const { id } = await params;

    const user = await getUser(false);

    const post = await getPost(id);

    const similarPost = await trpc.posts.getSimilarPosts({
        id: post.id,
        type: post.component.type,
    });

    return (
        <div className="container px-6 sm:mx-auto my-14 min-h-screen transition-all space-y-4">
            {/* Carousel + title, description, price */}
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex flex-col flex-1">
                    <Carousel className="w-full">
                        <CarouselContent className="ml-0">
                            {post.images.length > 0 ? (
                                post.images.map((image, index) => (
                                    <CarouselItem key={index} className="relative aspect-square w-full max-h-96">
                                        <Image
                                            src={image || "/images/fallback.webp"}
                                            alt={`Image ${index + 1}`}
                                            fill
                                            className="object-cover rounded-lg"
                                        />
                                    </CarouselItem>
                                ))
                            ) : (
                                <CarouselItem key={0} className="relative aspect-square w-full max-h-96">
                                    <Image
                                        src={"/images/fallback.webp"}
                                        alt={`L'utilisateur n'a pas téléversé d'images`}
                                        fill
                                        className="object-cover rounded-lg"
                                    />
                                </CarouselItem>
                            )}
                        </CarouselContent>
                        <CarouselPrevious className="-left-4" />
                        <CarouselNext className="-right-4" />
                    </Carousel>
                </div>
                <div className="flex flex-col gap-2 flex-1">
                    <div className="flex justify-between flex-col md:flex-row">
                        <h1 className="text-3xl font-bold">{post.title}</h1>
                        <BuyButtons initialUser={user} />
                    </div>
                    <p className="text-lg">{post.price} €</p>
                    <p className="text-sm max-h-120 lg:max-h-76 pr-2 overflow-auto">{post.description}</p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex flex-col gap-8 flex-1">
                    <div className="flex flex-col">
                        <div className="flex items-center">
                            <div className="flex items-center gap-4 flex-1">
                                <Avatar className="inline-flex h-12 shadow-sm  w-12 select-none items-center justify-center overflow-hidden rounded-full align-middle">
                                    <AvatarImage src="" />
                                    <AvatarFallback className="bg-card">{post.seller.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p>{post.seller.name}</p>
                                    {/* rating */}
                                    {post.seller.rating.count > 0 && (
                                        <div className="ml-auto flex items-center gap-1">
                                            <span className="text-xs font-medium">
                                                {post.seller.rating.avg.toFixed(1)} ({post.seller.rating.count})
                                            </span>
                                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <ContactButton initialUser={user} />
                        </div>
                    </div>
                    <Card className="gap-0">
                        <CardHeader>
                            <CardTitle className="text-xl">Specifications</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {formatComponentData(post.component.type, post.component.details as Components).map(
                                (uiString, index) => (
                                    <div key={index} className="text-sm text-muted-foreground">
                                        {uiString}
                                    </div>
                                )
                            )}
                        </CardContent>
                    </Card>
                </div>
                <div className="flex flex-col gap-8 flex-1">
                    <Card className="gap-2">
                        <CardHeader>
                            <CardTitle>Plus comme &quot;{post.title}&quot;</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-200 overflow-auto">
                            {similarPost.map((post) => (
                                <PostCard key={post.id} {...post} />
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
