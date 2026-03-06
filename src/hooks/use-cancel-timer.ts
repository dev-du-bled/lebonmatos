import { useState, useEffect } from "react";

const CANCEL_WINDOW_MS = 120_000;

export function useCancelTimer(soldAt: string | null) {
    const [remainingSeconds, setRemainingSeconds] = useState(() => {
        if (!soldAt) return 0;
        const elapsed = Date.now() - new Date(soldAt).getTime();
        return Math.max(0, Math.ceil((CANCEL_WINDOW_MS - elapsed) / 1000));
    });

    const canCancel = remainingSeconds > 0;

    useEffect(() => {
        if (!soldAt) {
            setRemainingSeconds(0);
            return;
        }

        const update = () => {
            const elapsed = Date.now() - new Date(soldAt).getTime();
            const secs = Math.max(
                0,
                Math.ceil((CANCEL_WINDOW_MS - elapsed) / 1000)
            );
            setRemainingSeconds(secs);
            return secs;
        };

        if (update() <= 0) return;

        const interval = setInterval(() => {
            if (update() <= 0) clearInterval(interval);
        }, 1000);

        return () => clearInterval(interval);
    }, [soldAt]);

    return { canCancel, remainingSeconds };
}
