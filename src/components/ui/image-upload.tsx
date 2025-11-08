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
} from "./carousel";
import { FileToBase64 } from "@/utils/file";

interface ImageUploadProps {
  onChange?: (files: string[]) => void;
  images: string[];
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
      const base64 = await FileToBase64(file);
      onChange?.([...images, base64]);
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

  const handleRemoveClick = (image: string) => {
    onChange?.(images.filter((i) => i !== image));
  };

  return (
    <div className="w-full flex flex-col gap-2">
      <div
        className="border border-accent border-dashed w-full h-full rounded-md cursor-pointer"
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
        hidden
        type="file"
        accept="image/*"
        onChange={handleFileChange}
      />

      {images.length > 0 && (
        <Carousel className="flex w-full h-full max-h-80" setApi={setApi}>
          <CarouselContent>
            {/* TODO: better image size maybe */}
            {images.map((image, index) => (
              <CarouselItem className="relative w-full" key={index}>
                <Image
                  src={image}
                  className="rounded-sm w-full h-auto object-contain"
                  alt="Preview"
                  width={1000}
                  height={200}
                />
                <Button
                  variant="destructive"
                  type="button"
                  size="icon"
                  onClick={() => handleRemoveClick(image)}
                  className="absolute right-2 top-2 w-4 h-4"
                >
                  <X />
                </Button>
              </CarouselItem>
            ))}
          </CarouselContent>
          {/* <CarouselPrevious className="left-1" /> */}
          {/* <CarouselNext className="right-1" /> */}
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
