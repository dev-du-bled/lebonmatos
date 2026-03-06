"use client";

import { useState, useEffect } from "react";
import { Badge } from "../ui/badge";
import { useSession } from "../auth/session-provider";
import { trpc } from "@/trpc/client";

export function UnreadBadge() {
    const { session } = useSession();
    const [unreadTotal, setUnreadTotal] = useState(0);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const { data: discussions } = trpc.discussions.getDiscussions.useQuery(
        undefined,
        { enabled: mounted && !!session?.user }
    );

    const utils = trpc.useUtils();

    useEffect(() => {
        if (discussions) {
            setUnreadTotal(
                discussions.reduce((sum, d) => sum + d.unreadCount, 0)
            );
        }
    }, [discussions]);

    trpc.discussions.onNewMessage.useSubscription(undefined, {
        enabled: mounted && !!session?.user,
        onData: () => {
            void utils.discussions.getDiscussions.invalidate();
        },
    });

    if (!mounted || unreadTotal <= 0) return null;

    return (
        <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 size-4 p-0 text-[10px] flex items-center justify-center pointer-events-none"
        >
            {unreadTotal > 9 ? "9+" : unreadTotal}
        </Badge>
    );
}
