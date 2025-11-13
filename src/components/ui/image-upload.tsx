"use client";

import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "./button";
import { Upload, X } from "lucide-react";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./carousel";

interface ImageUploadProps {
  images: File[];
  onChange?: (files: File[]) => void;
}

export default function ImageUpload({ onChange, images }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = useState<number>(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      onChange?.([...images, file]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFileChange({
      target: {
        files: e.dataTransfer.files,
      },
    } as ChangeEvent<HTMLInputElement>);
  };

  const handleRemoveClick = (image: File) => {
    onChange?.(images.filter((i) => i !== image));
    api?.scrollTo(images.indexOf(image) - 1);
  };

  return (
    <div className="w-full flex flex-col gap-2">
      <div
        className={`border border-accent border-dashed w-full h-full rounded-md ${
          images.length >= 6
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer hover:bg-accent/10 transition-colors"
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          handleDrop(e);
        }}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto my-4 w-6 h-6 text-muted-foreground" />
        <p className="text-center text-sm text-muted-foreground mb-4">
          Cliquer ou déposer une image pour l&apos;importer
        </p>
      </div>
      <input
        ref={inputRef}
        disabled={images.length >= 6}
        hidden
        type="file"
        accept="image/*"
        onChange={handleFileChange}
      />

      {images.length > 0 && (
        <Carousel setApi={setApi} className="relative">
          <Button
            variant="destructive"
            size="icon"
            type="button"
            className="absolute top-2 right-2 w-5 h-5 z-10 hover:opacity-80 transition-opacity"
            onClick={() => handleRemoveClick(images[current])}
          >
            <X />
          </Button>
          <CarouselContent className="ml-0">
            {images.map((image, index) => (
              <CarouselItem key={index} className="relative w-full h-64">
                <Image
                  src={URL.createObjectURL(image)}
                  alt={image.name || `Uploaded image ${index + 1}`}
                  fill
                  className="object-contain"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious type="button" className="left-1" />
          <CarouselNext type="button" className="right-1" />
          <div className="absolute bottom-2 w-full flex justify-center gap-2">
            {images.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  current === index ? "bg-primary/70" : "bg-secondary"
                }`}
                onClick={() => api?.scrollTo(index)}
              ></div>
            ))}
          </div>
        </Carousel>
      )}
    </div>
  );
}
