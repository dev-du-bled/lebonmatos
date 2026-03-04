import { type SelectedPost } from "@/components/configurator/post-card";

export type Annonce = {
    id: string;
    title: string;
    price?: number | string;
    imageSrc?: string;
    componentType?: string;
    specs: Record<string, string | number | undefined>;
};

export function mapSelectedToAnnonce(selected: SelectedPost[]): Annonce[] {
    return selected.map((c) => {
        const specs: Record<string, string | number | undefined> = {};

        switch (c.componentType) {
            case "CPU":
                specs["microarch"] = c.microarch;
                specs["coreCount"] = c.coreCount;
                specs["coreClock"] = c.coreClock;
                specs["boostClock"] = c.boostClock;
                break;

            case "GPU":
                specs["chipset"] = c.chipset;
                specs["memory"] = c.memory;
                specs["coreClock"] = c.coreClock;
                specs["boostClock"] = c.boostClock;
                specs["length"] = c.length;
                break;

            case "MOTHERBOARD":
                specs["socket"] = c.socket;
                specs["formFactor"] = c.formFactor;
                specs["maxMemory"] = c.maxMemory;
                specs["memorySlots"] = c.memorySlots;
                break;

            case "RAM":
                specs["type"] = c.ramType ?? c.type;
                specs["speed"] = c.speed;
                specs["modules"] = c.modules;
                specs["size"] = c.size;
                specs["casLatency"] = c.casLatency;
                break;

            case "SSD":
                specs["capacity"] = c.capacity;
                specs["cache"] = c.cache;
                specs["interface"] = c.interface;
                specs["formFactor"] = c.formFactor;
                break;

            case "HDD":
                specs["capacity"] = c.capacity;
                specs["cache"] = c.cache;
                specs["interface"] = c.interface;
                specs["formFactor"] = c.formFactor;
                break;

            case "POWER_SUPPLY":
                specs["type"] = c.psuType ?? c.type;
                specs["wattage"] = c.wattage;
                specs["efficiency"] = c.efficiency;
                specs["modular"] = c.modular;
                break;

            case "CPU_COOLER":
                specs["rpmIdle"] = c.rpmIdle;
                specs["rpmMax"] = c.rpmMax;
                specs["noiseIdle"] = c.noiseIdle;
                specs["noiseMax"] = c.noiseMax;
                specs["size"] = c.size;
                break;

            case "CASE":
                specs["type"] = c.caseType ?? c.type;
                specs["sidePanel"] = c.sidePanel;
                specs["volume"] = c.volume;
                specs["bays3_5"] = c.bays3_5;
                break;

            case "CASE_FAN":
                specs["size"] = c.size;
                specs["rpmIdle"] = c.rpmIdle;
                specs["rpmMax"] = c.rpmMax;
                specs["noiseIdle"] = c.noiseIdle;
                specs["noiseMax"] = c.noiseMax;
                specs["airflowIdle"] = c.airflowIdle;
                specs["airflowMax"] = c.airflowMax;
                break;

            case "SOUND_CARD":
                specs["channels"] = c.channels;
                specs["snr"] = c.snr;
                specs["sampleRate"] = c.sampleRate;
                specs["interface"] = c.interface;
                specs["chipset"] = c.chipset;
                break;

            case "WIRELESS_NETWORK_CARD":
                specs["interface"] = c.interface;
                specs["protocol"] = c.protocol;
                break;
        }

        // Supprimer les clés undefined pour ne pas polluer l'affichage
        (Object.keys(specs) as string[]).forEach((k) => {
            if (specs[k] === undefined) delete specs[k];
        });

        specs["price"] = c.price;

        return {
            id: c.id,
            title: c.title,
            price: c.price,
            imageSrc: c.images?.[0],
            componentType: c.componentType?.toLowerCase(),
            specs,
        };
    });
}
