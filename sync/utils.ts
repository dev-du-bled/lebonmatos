import { EnqueuedTaskPromise, Task } from "meilisearch";

export const wrappMeiliTask = async (
    task: EnqueuedTaskPromise
): Promise<Task> => {
    const taskresult = await task.waitTask({ timeout: 1200000 });
    if (taskresult.error) throw taskresult.error;

    return taskresult;
};

export const COMPONENT_INCLUDE = {
    Cpu: true,
    Gpu: true,
    Motherboard: true,
    Ram: true,
    Ssd: true,
    Hdd: true,
    Psu: true,
    CpuCooler: true,
    Case: true,
    CaseFan: true,
    SoundCard: true,
    WirelessNetworkCard: true,
} as const;

export const POST_INCLUDE = {
    user: true,
    component: {
        include: COMPONENT_INCLUDE,
    },
    location: true,
} as const;

export function toMeiliPost(post: {
    images: string[];
    location?: { lat: number; lon: number } | null;
    [key: string]: unknown;
}) {
    const { location, ...rest } = post;
    return {
        ...rest,
        firstImage: post.images?.[0] ?? null,
        location,
        _geo: location ? { lat: location.lat, lng: location.lon } : undefined,
    };
}

export function decimalToNumber<T>(obj: T): T {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === "object" && "toNumber" in (obj as object)) {
        return (obj as unknown as { toNumber: () => number }).toNumber() as T;
    }
    if (Array.isArray(obj)) return obj.map(decimalToNumber) as T;
    if (typeof obj === "object") {
        const result: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(
            obj as Record<string, unknown>
        )) {
            result[key] = decimalToNumber(value);
        }
        return result as T;
    }
    return obj;
}
