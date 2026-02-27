export type Trend = "up" | "down" | "mid" | "none";

const LABELS: Record<string, string> = {
    type: "Type",
    brand: "Marque",
    coreCount: "Nombre de cœurs",
    coreClock: "Fréquence (base)",
    boostClock: "Fréquence (boost)",
    microarch: "Architecture",
    tdp: "TDP",
    graphics: "Puce graphique intégrée",
    chipset: "Chipset",
    memory: "Mémoire",
    length: "Longueur",
    socket: "Type de processeur",
    formFactor: "Facteur de forme",
    maxMemory: "Mémoire max",
    memorySlots: "Nombre d'emplacements RAM",
    casLatency: "Latence CAS",
    modules: "Modules",
    speed: "Vitesse",
    size: "Taille",
    cache: "Cache",
    interface: "Interface",
    capacity: "Capacité",
    wattage: "Puissance",
    efficiency: "Efficacité",
    modular: "Modulaire",
    rpmIdle: "Vitesse au repos",
    rpmMax: "Vitesse max",
    noiseIdle: "Bruit au repos",
    noiseMax: "Bruit max",
    sidePanel: "Panneau latéral",
    volume: "Volume",
    bays3_5: 'Baies 3.5"',
    airflowIdle: "Flux d'air au repos",
    airflowMax: "Flux d'air max",
    pwm: "PWM",
    channels: "Canaux",
    digitalAudio: "Audio digital",
    snr: "Rapport signal/bruit",
    sampleRate: "Taux d'échantillonnage",
    protocol: "Protocole",
    price: "Prix",
};

export function humanizeKey(key: string): string {
    if (!key) return "";
    if (LABELS[key]) return LABELS[key];
    // Fallback: split camelCase / kebab-case
    return key
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .replace(/[_-]/g, " ")
        .split(" ")
        .map((s) => s[0]?.toUpperCase() + s.slice(1))
        .join(" ");
}

export function extractNumber(
    value: string | number | undefined
): number | null {
    if (value === undefined || value === null) return null;
    if (typeof value === "number") return Number.isFinite(value) ? value : null;
    const match = String(value).match(/-?\d+(\.\d+)?/);
    if (!match) return null;
    const num = parseFloat(match[0]);
    return Number.isFinite(num) ? num : null;
}

function applyUnit(key: string, num: number): string | number {
    switch (key) {
        case "tdp":
        case "wattage":
            return `${num} W`;
        case "price":
            return `${num} €`;
        case "coreclock":
        case "boostclock":
            // CPU clocks are stored as GHz (< 10), GPU as MHz (>= 100)
            return num < 10 ? `${num} GHz` : `${num} MHz`;
        case "speed":
            return `${num} MHz`;
        case "memory":
        case "size":
        case "maxmemory":
            return `${num} Go`;
        case "capacity":
            return num >= 1000 ? `${(num / 1000).toFixed(1)} To` : `${num} Go`;
        case "cache":
            return `${num} Mo`;
        case "length":
            return `${num} mm`;
        case "volume":
            return `${num} L`;
        case "noisidle":
        case "noismax":
        case "noiseidle":
        case "noisemax":
            return `${num} dB`;
        case "airflowidle":
        case "airflowmax":
            return `${num} CFM`;
        case "samplerate":
            return `${num} kHz`;
        case "snr":
            return `${num} dB`;
        default:
            return num;
    }
}

export function formatSpecValue(
    key: string,
    value: string | number | undefined
): string | number | undefined {
    if (value === undefined || value === null) return undefined;

    const keyLower = key.toLowerCase();

    // If already a string with a known unit suffix, return as-is
    if (typeof value === "string") {
        const str = value.trim();
        if (
            /\b(ghz|mhz|kb|mb|gb|tb|go|to|w|wh|€|eur|%|hz|mm|db|cfm)\b/i.test(
                str
            )
        )
            return str;
        // Only reformat if the string is purely numeric (digits, dot, optional sign)
        if (!/^-?\d+(\.\d+)?$/.test(str)) return str;
        const num = extractNumber(str);
        if (num === null) return str;
        return applyUnit(keyLower, num);
    }

    return applyUnit(keyLower, value);
}
