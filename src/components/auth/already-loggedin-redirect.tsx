/**
 * @description Component to redirect to the home page if the user is already logged in
 *
 * @param children - The children to wrap (optional)
 */

"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

export default function AlreadyLoggedInRedirect({
    children,
}: {
    children?: React.ReactNode | null;
}) {
    const router = useRouter();
    const { data, isPending } = authClient.useSession();
    const searchParams = useSearchParams();
    const redirect = searchParams.get("redirect");
    if (!isPending && data?.user) {
        router.push(redirect || "/");
    }
    return children;
}
