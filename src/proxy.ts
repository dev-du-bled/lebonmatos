import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
    const response = NextResponse.next({
        request: {
            headers: new Headers(request.headers),
        },
    });

    // Add the current pathname to headers so server components can access it
    response.headers.set("x-current-path", request.nextUrl.pathname);

    return response;
}

export const config = {
    // Match all routes except static files and api routes
    matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
