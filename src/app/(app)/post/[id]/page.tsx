import { getUser } from "@/app/utils/getUser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { trpc } from "@/trpc/server";
import { Components, formatComponentData } from "@/utils/components";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { ChevronRight, Star } from "lucide-react";
import Link from "next/link";

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await getUser(false);

  const post = await trpc.posts.getPost({ postId: id });

  const similarPost = await trpc.posts.getSimilarPosts({
    type: post.component.type,
  });

  return (
    <div className="container px-6 sm:mx-auto my-14 min-h-screen transition-all space-y-4">
      {/* Carousel + title, description, price */}
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex flex-col flex-1">
          <Carousel className="w-full">
            <CarouselContent className="ml-0">
              {post.images.map((image, index) => (
                <CarouselItem
                  key={index}
                  className="relative aspect-square w-full max-h-96"
                >
                  <Image
                    src={image.image}
                    alt={image.alt || `Image ${index + 1}`}
                    fill
                    className="object-cover rounded-lg"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="-left-4" />
            <CarouselNext className="-right-4" />
          </Carousel>
        </div>
        <div className="flex flex-col gap-2 flex-1">
          <h1 className="text-3xl font-bold">{post.title}</h1>
          <p className="text-lg">{post.price} €</p>
          <p className="text-sm max-h-120 lg:max-h-76 pr-2 overflow-auto">
            {post.description}
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex flex-col gap-8 flex-1">
          <div className="flex flex-col">
            <div className="flex items-center gap-4">
              <Avatar className="inline-flex h-12 w-12 select-none items-center justify-center overflow-hidden rounded-full align-middle">
                <AvatarImage src="" />
                <AvatarFallback>{post.seller.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <p>{post.seller.name}</p>
              {/* rating */}
              {post.seller.rating.count > 0 && (
                <div className="ml-auto flex items-center gap-1">
                  <span className="text-sm font-medium">
                    {post.seller.rating.avg.toFixed(1)} (
                    {post.seller.rating.count})
                  </span>
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                </div>
              )}
            </div>
          </div>
          <Card className="gap-0">
            <CardHeader>
              <CardTitle className="text-xl">Specifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {formatComponentData(
                post.component.type,
                post.component.details as Components
              ).map((uiString, index) => (
                <div key={index} className="text-sm text-muted-foreground">
                  {uiString}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        <div className="flex flex-col gap-8 flex-1">
          <Card className="gap-0">
            <CardHeader>
              <CardTitle>Plus comme &quot;{post.title}&quot;</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-200 overflow-auto">
                {similarPost.map((post) => (
                  <Link
                    key={post.id}
                    href={`/post/${post.id}`}
                    className="border rounded-lg overflow-hidden group relative"
                  >
                    <Image
                      src={post.images[0]?.image || "/placeholder.jpg"}
                      alt={post.images[0]?.alt || post.title}
                      width={400}
                      height={400}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h2 className="text-lg font-semibold">{post.title}</h2>
                      <p className="text-sm text-muted-foreground">
                        {post.price} €
                      </p>
                    </div>
                    <div className="absolute bottom-5 right-0 translate-x-full rounded-sm -skew-x-12 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 bg-primary w-fit h-fit  p-1 transition-all duration-300 shrink-0 mr-5">
                      <ChevronRight className="text-primary-foreground" />
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
