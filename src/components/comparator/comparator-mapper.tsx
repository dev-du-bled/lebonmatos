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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const comp = ((c as any).component ?? {}) as Record<string, any>;

        switch (c.componentType) {
            case "CPU": {
                const d = comp.Cpu ?? {};
                specs["microarch"] = d.microarch;
                specs["coreCount"] = d.coreCount;
                specs["coreClock"] = d.coreClock;
                specs["boostClock"] = d.boostClock;
                break;
            }
            case "GPU": {
                const d = comp.Gpu ?? {};
                specs["chipset"] = d.chipset;
                specs["memory"] = d.memory;
                specs["coreClock"] = d.coreClock;
                specs["boostClock"] = d.boostClock;
                specs["length"] = d.length;
                break;
            }
            case "MOTHERBOARD": {
                const d = comp.Motherboard ?? {};
                specs["socket"] = d.socket;
                specs["formFactor"] = d.formFactor;
                specs["maxMemory"] = d.maxMemory;
                specs["memorySlots"] = d.memorySlots;
                break;
            }
            case "RAM": {
                const d = comp.Ram ?? {};
                specs["type"] = d.type ?? d.ramType;
                specs["speed"] = d.speed;
                specs["modules"] = d.modules;
                specs["size"] = d.size;
                specs["casLatency"] = d.casLatency;
                break;
            }
            case "SSD": {
                const d = comp.Ssd ?? {};
                specs["capacity"] = d.capacity;
                specs["cache"] = d.cache;
                specs["interface"] = d.interface;
                specs["formFactor"] = d.formFactor;
                break;
            }
            case "HDD": {
                const d = comp.Hdd ?? {};
                specs["capacity"] = d.capacity;
                specs["cache"] = d.cache;
                specs["interface"] = d.interface;
                specs["formFactor"] = d.formFactor;
                break;
            }
            case "POWER_SUPPLY": {
                const d = comp.Psu ?? {};
                specs["type"] = d.type ?? d.psuType;
                specs["wattage"] = d.wattage;
                specs["efficiency"] = d.efficiency;
                specs["modular"] = d.modular;
                break;
            }
            case "CPU_COOLER": {
                const d = comp.CpuCooler ?? {};
                specs["rpmIdle"] = d.rpmIdle;
                specs["rpmMax"] = d.rpmMax;
                specs["noiseIdle"] = d.noiseIdle;
                specs["noiseMax"] = d.noiseMax;
                specs["size"] = d.size;
                break;
            }
            case "CASE": {
                const d = comp.Case ?? {};
                specs["type"] = d.type ?? d.caseType;
                specs["sidePanel"] = d.sidePanel;
                specs["volume"] = d.volume;
                specs["bays3_5"] = d.bays3_5;
                break;
            }
            case "CASE_FAN": {
                const d = comp.CaseFan ?? {};
                specs["size"] = d.size;
                specs["rpmIdle"] = d.rpmIdle;
                specs["rpmMax"] = d.rpmMax;
                specs["noiseIdle"] = d.noiseIdle;
                specs["noiseMax"] = d.noiseMax;
                specs["airflowIdle"] = d.airflowIdle;
                specs["airflowMax"] = d.airflowMax;
                break;
            }
            case "SOUND_CARD": {
                const d = comp.SoundCard ?? {};
                specs["channels"] = d.channels;
                specs["snr"] = d.snr;
                specs["sampleRate"] = d.sampleRate;
                specs["interface"] = d.interface;
                specs["chipset"] = d.chipset;
                break;
            }
            case "WIRELESS_NETWORK_CARD": {
                const d = comp.WirelessNetworkCard ?? {};
                specs["interface"] = d.interface;
                specs["protocol"] = d.protocol;
                break;
            }
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
