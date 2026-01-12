/**
 * @description Component to wrap children and redirect to login page if user is not logged in
 *
 * @param children - The children to wrap (optional)
 */

"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

export default function RequiredLogin({
    children,
}: {
    children?: React.ReactNode | null;
}) {
    const router = useRouter();
    const pathname = usePathname();

    const { data, isPending } = authClient.useSession();

    if (!isPending && !data?.user) {
        router.push("/login?redirect=" + pathname);
        return null;
    }
    return children;
}
