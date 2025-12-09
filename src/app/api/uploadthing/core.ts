import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const authMiddleware = async ({ req }: { req: NextRequest }) => {
    const session = await auth.api.getSession({
        headers: req.headers,
    });

    if (!session?.user) throw new UploadThingError("Unauthorized");

    return { userId: session.user.id };
};

const f = createUploadthing();

export const lbmFileRouter = {
    postUploader: f({
        image: {
            maxFileSize: "4MB",
            maxFileCount: 6,
        },
    })
        .middleware(authMiddleware)
        .onUploadComplete(async ({ metadata, file }) => {
            console.log("Upload complete for userId:", metadata.userId);
            console.log("file url", file.ufsUrl);

            return { alt: file.name, source: file.ufsUrl };
        }),
    pofilPicUploader: f({
        image: {
            maxFileSize: "4MB",
            maxFileCount: 1,
        },
    })
        .middleware(authMiddleware)
        .onUploadComplete(async ({ metadata, file }) => {
            // This code RUNS ON YOUR SERVER after upload
            console.log("Upload complete for userId:", metadata.userId);
            console.log("file url", file.ufsUrl);

            // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
            return { alt: file.name, source: file.ufsUrl };
        }),
} satisfies FileRouter;

export type LbmFileRouter = typeof lbmFileRouter;
