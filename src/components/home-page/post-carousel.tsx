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
            <span className="text-xl sm:text-2xl font-bold font-sans text-foreground py-2">
                {headerText}
            </span>
            {posts.length > 0 ? (
                <Carousel className="w-full relative">
                    <CarouselContent>
                        {posts.map((post) => {
                            return (
                                <CarouselItem
                                    className="basis-1/2 sm:basis-1/3 lg:basis-1/5"
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
                    <CarouselPrevious className="absolute -left-5 top-1/2 -translate-y-1/2" />
                    <CarouselNext className="absolute -right-5 top-1/2 -translate-y-1/2" />
                </Carousel>
            ) : (
                <span className="self-center text-xl font-sans my-10 text-foreground">
                    Aucune annonces :(
                </span>
            )}
        </div>
    );
}
