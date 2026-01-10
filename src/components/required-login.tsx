"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

export default function RequiredLogin({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    
    const { data, isPending } = authClient.useSession();

    if (!isPending && !data?.user) {
        router.push("/login?redirect=" + pathname);
        return null;
    }
    return children;
}