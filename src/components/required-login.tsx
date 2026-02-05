/**
 * @description Server component that checks authentication and redirects to login if not authenticated.
 * Also includes RequiredLoginClient to handle client-side session changes (e.g., logout).
 *
 * @param children - The children to render if authenticated
 */

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import RequiredLoginClient from "./required-login-client";

export default async function RequiredLogin({
    children,
}: {
    children?: React.ReactNode | null;
}) {
    const hdrs = await headers();
    const session = await auth.api.getSession({ headers: hdrs });

    if (!session?.user) {
        const pathname = hdrs.get("x-current-path") || "/";
        redirect(`/login?redirect=${pathname}`);
    }

    // Wrap children in RequiredLoginClient to handle client-side session changes
    return <RequiredLoginClient>{children}</RequiredLoginClient>;
}
