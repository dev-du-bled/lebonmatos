"use client";

import { useDropzone } from "@uploadthing/react";
import { X, UploadCloud } from "lucide-react";
import Image from "next/image";
import { useCallback, useMemo } from "react";

type UploadComponentProps = {
    variant: "button" | "dropzone";
    disabled?: boolean;
    maxImages: number;
    images: File[] | string[];
    onChange: (files: File[] | string[]) => void;
};

export default function ImageUpload({
    variant,
    disabled,
    maxImages,
    images,
    onChange,
}: UploadComponentProps) {
    const removeImage = (index: number) => {
        const filtered = images.filter((_, i) => i !== index);
        onChange(filtered as File[] | string[]);
    };

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            if (!acceptedFiles?.length) return;
            onChange([...images, ...acceptedFiles] as File[] | string[]);
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
        disabled: images.length === maxImages,
    });

    const imageSources = useMemo(() => {
        return images.map((image) =>
            typeof image === "string" ? image : URL.createObjectURL(image)
        );
    }, [images]);

    useCallback(() => {
        return () => {
            imageSources.forEach((src) => {
                if (src.startsWith("blob:")) {
                    URL.revokeObjectURL(src);
                }
            });
        };
    }, [imageSources]);

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
                            key={
                                typeof image === "string"
                                    ? `image-${index}`
                                    : `${image.name}`
                            }
                            className="relative border border-muted-foreground/20 rounded-md overflow-hidden flex h-30 w-30"
                        >
                            <button
                                type="button"
                                className="hover:cursor-pointer absolute top-1 right-1 rounded-full bg-destructive flex items-center justify-center w-5 h-5 hover:bg-destructive/80 opacity-90"
                                title={`Remove ${
                                    typeof image === "string"
                                        ? `image-${index}`
                                        : `${image.name}`
                                }`}
                                onClick={() => removeImage(index)}
                            >
                                <X size={14} />
                            </button>
                            <Image
                                src={imageSources[index]}
                                alt={
                                    typeof image === "string"
                                        ? "Uploaded Image"
                                        : image.name
                                }
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
