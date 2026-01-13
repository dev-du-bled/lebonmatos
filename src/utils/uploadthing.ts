import {
    generateReactHelpers,
    generateUploadButton,
    generateUploadDropzone,
} from "@uploadthing/react";

import type { LbmFileRouter } from "@/app/api/uploadthing/core";

export const UploadButton = generateUploadButton<LbmFileRouter>();
export const UploadDropzone = generateUploadDropzone<LbmFileRouter>();
export const { useUploadThing, uploadFiles } =
    generateReactHelpers<LbmFileRouter>();
