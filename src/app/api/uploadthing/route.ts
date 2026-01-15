import { createRouteHandler } from "uploadthing/next";

import { lbmFileRouter } from "./core";

// Export routes for Next App Router
export const { GET, POST } = createRouteHandler({
    router: lbmFileRouter,
});
