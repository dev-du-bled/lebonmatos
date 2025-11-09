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

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await getUser(false);

  const post = await trpc.posts.getPost({ postId: id });

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
                    src={image}
                    alt={`Image ${index + 1}`}
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
            <CardContent></CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
