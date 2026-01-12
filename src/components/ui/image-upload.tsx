"use client";

import { useDropzone } from "@uploadthing/react";
import { X, UploadCloud } from "lucide-react";
import Image from "next/image";
import { useCallback } from "react";

type UploadComponentProps = {
    variant: "button" | "dropzone";
    disabled?: boolean;
    maxImages: number;
    images: File[];
    onChange: (files: File[]) => void;
};

export default function ImageUpload({
    variant,
    disabled,
    maxImages,
    images,
    onChange,
}: UploadComponentProps) {
    const removeImage = (index: number) => {
        onChange(images.filter((_, i) => i !== index));
    };

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            if (!acceptedFiles?.length) return;
            onChange([...images, ...acceptedFiles]);
        },
        [onChange, images]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "image/jpeg": [".jpg", ".jpeg"],
            "image/png": [".png"],
            "image/webp": [".webp"],
        },
        maxFiles: maxImages - images.length,
        multiple: true,
        maxSize: 4 * 1024 * 1024,
    });

    return variant === "button" ? (
        <></>
    ) : (
        <>
            <div {...getRootProps()}>
                <input
                    {...getInputProps()}
                    aria-label="Upload images"
                    disabled={disabled}
                    className="peer"
                />
                <div
                    className={`flex flex-col text-center hover:cursor-pointer peer-disabled:opacity-40 peer-disabled:hover:cursor-default  items-center gap-2 p-4 border border-dashed border-muted-foreground rounded-md transition-colors duration-200 ${
                        isDragActive && "border-muted-foreground/60"
                    }}`}
                >
                    <UploadCloud className="text-primary" />
                    {isDragActive ? (
                        <p className="text-sm">Déposez les images ici</p>
                    ) : (
                        <p className="text-sm">
                            Sélectionnez ou glissez-déposez des images
                        </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                        {maxImages} fichiers JPG, PNG, WEBP jusqu&apos;à 4Mo par
                        fichiers
                    </p>
                </div>
            </div>

            {images.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center justify-start  gap-3">
                    {images.map((image, index) => (
                        <div
                            key={`${image.name}-${index}`}
                            className="relative border border-muted-foreground/20 rounded-md overflow-hidden flex h-30 w-30"
                        >
                            <button
                                type="button"
                                className="hover:cursor-pointer absolute top-1 right-1 rounded-full bg-destructive flex items-center justify-center w-5 h-5 hover:bg-destructive/80 opacity-90"
                                title={`Remove ${image.name}`}
                                onClick={() => removeImage(index)}
                            >
                                <X size={14} />
                            </button>
                            <Image
                                src={URL.createObjectURL(image)}
                                alt={image.name || "Uploaded Image"}
                                width={160}
                                height={160}
                                className="object-cover rounded-md w-full h-auto"
                            />
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}
