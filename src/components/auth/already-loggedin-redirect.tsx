/**
 * @description Component to redirect to the home page if the user is already logged in
 *
 * @param children - The children to wrap (optional)
 */

"use client";

import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useSession } from "./session-provider";

export default function AlreadyLoggedInRedirect({
    children,
}: {
    children?: React.ReactNode | null;
}) {
    const router = useRouter();
    const { session, isPending } = useSession();
    const searchParams = useSearchParams();
    const redirect = searchParams.get("redirect");
    if (!isPending && session?.user) {
        router.push(redirect || "/");
    }
    return children;
}
