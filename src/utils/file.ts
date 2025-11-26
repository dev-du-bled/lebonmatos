export async function Base64ToFile(
    fileString: string,
    fileName: string
): Promise<File> {
    const data = await fetch(fileString);

    const blob = await data.blob();

    return new File([blob], fileName, { type: "image/webp" });
}

export async function FileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
}
