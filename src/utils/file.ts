export async function Base64ToFile(
    fileString: string,
    fileName: string
): Promise<File> {
    const data = await fetch(fileString);

    const blob = await data.blob();

    return new File([blob], fileName, { type: "image/webp" });
}

export async function FileToBase64(file: File): Promise<string> {
    if (typeof FileReader === "undefined") {
        const buffer = await file.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");
        return `data:${file.type || "image/png"};base64,${base64}`;
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file as Blob);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
}
