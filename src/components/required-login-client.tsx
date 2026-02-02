/**
 * @description Client component that monitors session state and redirects to login if user logs out.
 * Should be used alongside RequiredLogin (server component) for complete protection.
 *
 * @param children - The children to wrap (optional)
 */

"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

export default function RequiredLoginClient({
    children,
}: {
    children?: React.ReactNode | null;
}) {
    const router = useRouter();
    const pathname = usePathname();

    const { data, isPending } = authClient.useSession();

    // Redirect to login if session is loaded and user is not authenticated
    if (!isPending && !data?.user) {
        router.push("/login?redirect=" + pathname);
        return null;
    }

    return children;
}
