import { UTApi } from "uploadthing/server";

export const utapi = new UTApi();

/**
 * Extracts UploadThing file keys from URLs and deletes the files.
 * No-op if the array is empty.
 */
export async function deleteUploadThingImages(urls: string[]): Promise<void> {
    if (urls.length === 0) return;
    const keys = urls.map((img) => {
        const url = new URL(img);
        return url.pathname.split("/").pop()?.split("?")[0] ?? img;
    });
    await utapi.deleteFiles(keys);
}
