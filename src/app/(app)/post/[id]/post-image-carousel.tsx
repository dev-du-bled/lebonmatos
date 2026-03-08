"use client";

import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useLightbox } from "@/components/ui/lightbox";
import Image from "next/image";

export default function PostImageCarousel({ images }: { images: string[] }) {
    const openLightbox = useLightbox();
    const displayImages =
        images.length > 0 ? images : ["/images/fallback.webp"];

    return (
        <Carousel className="w-full relative">
            <CarouselContent className="ml-0">
                {displayImages.map((image: string, index: number) => (
                    <CarouselItem key={index} className="pl-0">
                        <AspectRatio ratio={4 / 3}>
                            <Image
                                src={image || "/images/fallback.webp"}
                                alt={`Image ${index + 1}`}
                                fill
                                className="object-cover cursor-pointer"
                                onClick={() =>
                                    openLightbox(displayImages, index)
                                }
                            />
                        </AspectRatio>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
        </Carousel>
    );
}
