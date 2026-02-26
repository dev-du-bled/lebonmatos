export type Trend = "up" | "down" | "none";

export function humanizeKey(key: string) {
    if (!key) return "";

    const LABELS: Record<string, string> = {
        type: "Type",
        brand: "Marque",
        coreCount: "Nombre de cœurs",
        coreClock: "Fréquence (base)",
        boostClock: "Fréquence (boost)",
        tdp: "TDP",
        chipset: "Chipset",
        memory: "Mémoire",
        speed: "Vitesse",
        size: "Taille",
        casLatency: "CAS Latency",
        capacity: "Capacité",
        interface: "Interface",
        wattage: "Puissance",
        efficiency: "Efficacité",
        price: "Prix",
    };

    const lower = key.toLowerCase();
    const labelsLower: Record<string, string> = {};
    Object.entries(LABELS).forEach(([k, v]) => {
        labelsLower[k.toLowerCase()] = v;
    });

    if (LABELS[key]) return LABELS[key];
    if (labelsLower[lower]) return labelsLower[lower];

    if (key.toUpperCase() === key) return key;

    const spaced = key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[_-]/g, " ");

    return spaced
        .split(" ")
        .map((s) => s[0]?.toUpperCase() + s.slice(1))
        .join(" ");
}

export function extractNumber(value: string | number | undefined): number | null {
    if (value === undefined || value === null) return null;

    if (typeof value === "number") return value;

    const match = String(value).match(/-?\d+(\.\d+)?/);

    if (!match) return null;

    const num = parseFloat(match[0]);

    return Number.isFinite(num) ? num : null;
}

export function formatSpecValue(key: string, value: string | number | undefined): string | number | undefined {
    if (value === undefined || value === null) return undefined;

    const keyLower = key.toLowerCase();

    if (typeof value === "number") {
        switch (keyLower) {
            case "tdp":
            case "wattage":
                return `${value} W`;
            case "price":
                return `${value} €`;
            case "coreclock":
            case "boostclock":
            case "speed":
                return value < 10 ? `${value} GHz` : `${value} MHz`;
            case "memory":
            case "size":
            case "capacity":
                return `${value} GB`;
            default:
                return value;
        }
    }

    const str = String(value).trim();

    if (/\b(ghz|mhz|kb|mb|gb|tb|w|wh|€|eur|%|hz)\b/i.test(str)) return str;

    const num = extractNumber(str);
    if (num === null) return str;

    switch (keyLower) {
        case "tdp":
        case "wattage":
            return `${num} W`;
        case "price":
            return `${num} €`;
        case "coreclock":
        case "boostclock":
        case "speed":
            return num < 10 ? `${num} GHz` : `${num} MHz`;
        case "memory":
        case "size":
        case "capacity":
            return `${num} GB`;
        default:
            return str;
    }
}
