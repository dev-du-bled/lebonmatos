"use client";

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

import ComparatorCard from "./comparator-card";
import ComparatorAddCard from "./comparator-add-card";
import { Annonce } from "./comparator-mapper";
import { Trend } from "./comparator-utils";

interface Props {
    components: Annonce[];
    allKeys: string[];
    nonNumericKeys: Set<string>;
    trends: Record<string, Record<string, Trend>>;

    onRemove: (id: string) => void;
    onReplace: (i: number) => void;
    onAdd: () => void;
    humanizeKey: (k: string) => string;
}

export default function ComparatorCarousel({
    components,
    allKeys,
    nonNumericKeys,
    trends,
    onRemove,
    onReplace,
    onAdd,
    humanizeKey,
}: Props) {
    const addCardData = {
        id: "__add__",
        title: "Ajouter une annonce",
        imageSrc: undefined,
        specs: {},
    };

    return (
        <Carousel className="w-full">
            <CarouselContent>
                {components.map((c, i) => (
                    <CarouselItem key={c.id} className="md:basis-1/2 xl:basis-1/3 px-4">
                        <ComparatorCard
                            data={c}
                            index={i}
                            allKeys={allKeys}
                            nonNumericKeys={nonNumericKeys}
                            trends={trends}
                            onRemove={onRemove}
                            onReplace={onReplace}
                            humanizeKey={humanizeKey}
                        />
                    </CarouselItem>
                ))}

                {/* Add card - always last */}
                <CarouselItem key={addCardData.id} className="md:basis-1/2 xl:basis-1/3 px-4">
                    <ComparatorAddCard onAdd={onAdd} />
                </CarouselItem>
            </CarouselContent>

            <CarouselPrevious />
            <CarouselNext />
        </Carousel>
    );
}
