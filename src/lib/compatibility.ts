import {
    Case,
    CaseFan,
    ComponentType,
    Cpu,
    CpuCooler,
    Gpu,
    Hdd,
    Motherboard,
    Psu,
    Ram,
    SoundCard,
    Ssd,
    WirelessNetworkCard,
} from "@prisma/client";

// Map CPU microarchitecture to socket
const MICROARCH_TO_SOCKET: Record<string, string> = {
    // AMD
    "Zen 5": "AM5",
    "Zen 4": "AM5",
    "Zen 3": "AM4",
    "Zen 2": "AM4",
    "Zen+": "AM4",
    Zen: "AM4",
    // Intel
    "Arrow Lake": "LGA1851",
    "Raptor Lake Refresh": "LGA1700",
    "Raptor Lake": "LGA1700",
    "Alder Lake": "LGA1700",
    "Rocket Lake": "LGA1200",
    "Comet Lake": "LGA1200",
    "Coffee Lake Refresh": "LGA1151",
    "Coffee Lake": "LGA1151",
};

// Default memory type by socket (for sockets that only support one type)
const SOCKET_DEFAULT_MEMORY_TYPE: Record<string, string> = {
    // DDR5 only
    AM5: "DDR5",
    LGA1851: "DDR5",
    // DDR4 only
    AM4: "DDR4",
    LGA1200: "DDR4",
    LGA1151: "DDR4",
    // DDR3
    "AM3+": "DDR3",
    AM3: "DDR3",
    LGA1155: "DDR3",
    LGA1156: "DDR3",
};

// Sockets that can have both DDR4 and DDR5 depending on the board
const AMBIGUOUS_DDR_SOCKETS = ["LGA1700"];

// Determine motherboard memory type from socket + name
function getMotherboardMemoryType(socket: string, name: string): string | null {
    const upperName = name.toUpperCase();

    // For ambiguous sockets, check the board name
    if (AMBIGUOUS_DDR_SOCKETS.includes(socket)) {
        if (upperName.includes("DDR4")) return "DDR4";
        // LGA1700 boards default to DDR5 unless explicitly DDR4
        return "DDR5";
    }

    return SOCKET_DEFAULT_MEMORY_TYPE[socket] || null;
}

type CompDetails<T> = Omit<T, "id" | "componentId">;

export type ComponentWithDetails = {
    id: string;
    type: ComponentType;
    name: string;
    Cpu?: CompDetails<Cpu> | null;
    Gpu?: CompDetails<Gpu> | null;
    Motherboard?: CompDetails<Motherboard> | null;
    Ram?: CompDetails<Ram> | null;
    Ssd?: CompDetails<Ssd> | null;
    Hdd?: CompDetails<Hdd> | null;
    Psu?: CompDetails<Psu> | null;
    CpuCooler?: CompDetails<CpuCooler> | null;
    Case?: CompDetails<Case> | null;
    CaseFan?: CompDetails<CaseFan> | null;
    SoundCard?: CompDetails<SoundCard> | null;
    WirelessNetworkCard?: CompDetails<WirelessNetworkCard> | null;
};

export type ConfigurationSlot = {
    componentType: ComponentType;
    post?: {
        id: string;
        title: string;
        price: number;
        images: string[];
        component: ComponentWithDetails;
    } | null;
    quantity: number;
};

export type CompatibilityIssue = {
    type: "error" | "warning";
    message: string;
    affectedComponents: ComponentType[];
};

// Get the socket for a CPU based on its microarchitecture
export function getCpuSocket(microarch: string): string | null {
    return MICROARCH_TO_SOCKET[microarch] || null;
}

// Check compatibility between components in a configuration
export function checkCompatibility(
    slots: ConfigurationSlot[]
): CompatibilityIssue[] {
    const issues: CompatibilityIssue[] = [];

    const cpu = slots.find((s) => s.componentType === "CPU")?.post?.component;
    const motherboard = slots.find((s) => s.componentType === "MOTHERBOARD")
        ?.post?.component;
    const rams = slots.filter((s) => s.componentType === "RAM");
    const psu = slots.find((s) => s.componentType === "POWER_SUPPLY")?.post
        ?.component;
    const gpu = slots.find((s) => s.componentType === "GPU")?.post?.component;
    const pcCase = slots.find((s) => s.componentType === "CASE")?.post
        ?.component;

    // CPU <-> Motherboard socket compatibility
    if (cpu?.Cpu && motherboard?.Motherboard) {
        const cpuSocket = getCpuSocket(cpu.Cpu.microarch);
        const mbSocket = motherboard.Motherboard.socket;

        if (!cpuSocket) {
            // If we can't determine the socket, we can't verify compatibility
            // We could add a warning here if strict mode is desired
        } else if (cpuSocket !== mbSocket) {
            issues.push({
                type: "error",
                message: `Le processeur (socket ${cpuSocket}) n'est pas compatible avec la carte mère (socket ${mbSocket})`,
                affectedComponents: ["CPU", "MOTHERBOARD"],
            });
        }
    }

    // RAM <-> Motherboard compatibility
    if (rams.length > 0 && motherboard?.Motherboard) {
        const totalRamSlots = rams.reduce((acc, r) => {
            const modules = r.post?.component?.Ram?.modules || 1;
            return acc + modules * r.quantity;
        }, 0);

        // Check slot count
        if (totalRamSlots > motherboard.Motherboard.memorySlots) {
            issues.push({
                type: "error",
                message: `Trop de barrettes RAM (${totalRamSlots}) pour la carte mère (${motherboard.Motherboard.memorySlots} slots)`,
                affectedComponents: ["RAM", "MOTHERBOARD"],
            });
        }

        // Determine the motherboard's memory type
        const mbMemoryType = getMotherboardMemoryType(
            motherboard.Motherboard.socket,
            motherboard.name
        );

        // Check RAM type compatibility with motherboard
        if (mbMemoryType) {
            for (const ram of rams) {
                const ramType = ram.post?.component?.Ram?.type;
                if (ramType && ramType !== mbMemoryType) {
                    issues.push({
                        type: "error",
                        message: `La RAM ${ramType} n'est pas compatible avec la carte mère qui supporte ${mbMemoryType}`,
                        affectedComponents: ["RAM", "MOTHERBOARD"],
                    });
                }
            }
        }

        // Check mixed RAM types (e.g. DDR4 + DDR5)
        const ramTypes = new Set(
            rams.map((r) => r.post?.component?.Ram?.type).filter(Boolean)
        );
        if (ramTypes.size > 1) {
            issues.push({
                type: "error",
                message: `Types de RAM différents dans la configuration (${[...ramTypes].join(", ")})`,
                affectedComponents: ["RAM"],
            });
        }

        // Check total RAM capacity
        const totalRamGb = rams.reduce((acc, r) => {
            const size = r.post?.component?.Ram?.size || 0;
            const modules = r.post?.component?.Ram?.modules || 1;
            return acc + size * modules * r.quantity;
        }, 0);

        if (totalRamGb > motherboard.Motherboard.maxMemory) {
            issues.push({
                type: "warning",
                message: `Capacité RAM totale (${totalRamGb}Go) dépasse le maximum supporté par la carte mère (${motherboard.Motherboard.maxMemory}Go)`,
                affectedComponents: ["RAM", "MOTHERBOARD"],
            });
        }
    }

    // Case <-> Motherboard form factor compatibility
    if (pcCase?.Case && motherboard?.Motherboard) {
        const caseType = pcCase.Case.type.toLowerCase();
        const mbFormFactor = motherboard.Motherboard.formFactor.toLowerCase();

        const caseFormFactorSupport: Record<string, string[]> = {
            "atx full tower": ["atx", "micro atx", "mini itx", "eatx"],
            "atx mid tower": ["atx", "micro atx", "mini itx"],
            "micro atx mid tower": ["micro atx", "mini itx"],
            "mini itx": ["mini itx"],
            htpc: ["mini itx", "micro atx"],
        };

        const supportedFormFactors = caseFormFactorSupport[caseType] || [];
        if (
            supportedFormFactors.length > 0 &&
            !supportedFormFactors.includes(mbFormFactor)
        ) {
            issues.push({
                type: "error",
                message: `Le boîtier (${pcCase.Case.type}) ne supporte pas le format de carte mère (${motherboard.Motherboard.formFactor})`,
                affectedComponents: ["CASE", "MOTHERBOARD"],
            });
        }
    }

    // PSU wattage check (basic estimate)
    if (psu?.Psu) {
        let estimatedWattage = 100; // Base system

        if (cpu?.Cpu) {
            // TDP is in the CPU model but we don't have it in ComponentWithDetails
            // Estimate based on typical values
            estimatedWattage += 125;
        }

        if (gpu?.Gpu) {
            // Estimate GPU power based on VRAM (rough approximation)
            const gpuPower =
                gpu.Gpu.memory >= 12 ? 250 : gpu.Gpu.memory >= 8 ? 150 : 75;
            estimatedWattage += gpuPower;
        }

        if (psu.Psu.wattage < estimatedWattage) {
            issues.push({
                type: "warning",
                message: `L'alimentation (${psu.Psu.wattage}W) pourrait être insuffisante pour cette configuration (estimé ~${estimatedWattage}W)`,
                affectedComponents: ["POWER_SUPPLY", "CPU", "GPU"],
            });
        }
    }

    return issues;
}

// Component types that can have multiple items
export const MULTI_QUANTITY_TYPES: ComponentType[] = [
    "RAM",
    "SSD",
    "HDD",
    "CASE_FAN",
];

// Required components for a complete PC build
export const REQUIRED_COMPONENTS: ComponentType[] = [
    "CPU",
    "MOTHERBOARD",
    "RAM",
    "POWER_SUPPLY",
    "CASE",
];

// Optional components
export const OPTIONAL_COMPONENTS: ComponentType[] = [
    "GPU",
    "SSD",
    "HDD",
    "CPU_COOLER",
    "CASE_FAN",
    "SOUND_CARD",
    "WIRELESS_NETWORK_CARD",
];

// All component types in display order
export const ALL_COMPONENT_TYPES: ComponentType[] = [
    "CPU",
    "MOTHERBOARD",
    "RAM",
    "GPU",
    "SSD",
    "HDD",
    "POWER_SUPPLY",
    "CPU_COOLER",
    "CASE",
    "CASE_FAN",
    "SOUND_CARD",
    "WIRELESS_NETWORK_CARD",
];

// Component type labels in French
export const COMPONENT_TYPE_LABELS: Record<ComponentType, string> = {
    CPU: "Processeur",
    GPU: "Carte graphique",
    MOTHERBOARD: "Carte mère",
    RAM: "Mémoire RAM",
    SSD: "SSD",
    HDD: "Disque dur",
    POWER_SUPPLY: "Alimentation",
    CPU_COOLER: "Ventirad",
    CASE: "Boîtier",
    CASE_FAN: "Ventilateur",
    SOUND_CARD: "Carte son",
    WIRELESS_NETWORK_CARD: "Carte WiFi",
};

// Indefinite articles for component types (French gender agreement)
export const COMPONENT_TYPE_ARTICLES: Record<ComponentType, string> = {
    CPU: "un",
    GPU: "une",
    MOTHERBOARD: "une",
    RAM: "une",
    SSD: "un",
    HDD: "un",
    POWER_SUPPLY: "une",
    CPU_COOLER: "un",
    CASE: "un",
    CASE_FAN: "un",
    SOUND_CARD: "une",
    WIRELESS_NETWORK_CARD: "une",
};

// Check if configuration is complete (has all required components)
export function isConfigurationComplete(slots: ConfigurationSlot[]): boolean {
    return REQUIRED_COMPONENTS.every((type) =>
        slots.some((s) => s.componentType === type && s.post)
    );
}

// Check if configuration has storage (SSD or HDD)
export function hasStorage(slots: ConfigurationSlot[]): boolean {
    return slots.some(
        (s) =>
            (s.componentType === "SSD" || s.componentType === "HDD") && s.post
    );
}
