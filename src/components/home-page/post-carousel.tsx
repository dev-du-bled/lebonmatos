import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "../ui/carousel";
import PostPreview from "./post-preview";
import { trpc } from "@/trpc/server";

interface PostCarouselProps {
    headerText: string;
    posts: Awaited<ReturnType<typeof trpc.posts.getHomePage>>["posts"];
    fullHeight?: boolean;
}

export default function PostCarousel({
    headerText,
    posts,
    fullHeight,
}: PostCarouselProps) {
    return (
        <div className="flex flex-col w-full">
            <span className="text-2xl font-bold font-sans text-foreground">
                {headerText}
            </span>
            {posts.length > 0 ? (
                <Carousel className="w-full">
                    <CarouselContent>
                        {posts.map((post) => {
                            return (
                                <CarouselItem
                                    className="lg:basis-1/5 sm:basis-1/3"
                                    key={post.id}
                                >
                                    <PostPreview
                                        fullHeight={fullHeight || false}
                                        post={post}
                                    />
                                </CarouselItem>
                            );
                        })}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
            ) : (
                <span className="self-center text-xl font-sans my-10 text-foreground">
                    Aucune annonces :(
                </span>
            )}
        </div>
    );
}
