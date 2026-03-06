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
        const comp = c.component;

        switch (comp.type) {
            case "CPU": {
                const d = comp.Cpu;
                if (d) {
                    specs["microarch"] = d.microarch;
                    specs["coreCount"] = d.coreCount;
                    specs["coreClock"] = Number(d.coreClock);
                    specs["boostClock"] = d.boostClock
                        ? Number(d.boostClock)
                        : undefined;
                }
                break;
            }
            case "GPU": {
                const d = comp.Gpu;
                if (d) {
                    specs["chipset"] = d.chipset;
                    specs["memory"] = d.memory;
                    specs["coreClock"] = d.coreClock ?? undefined;
                    specs["boostClock"] = d.boostClock ?? undefined;
                    specs["length"] = d.length ?? undefined;
                }
                break;
            }
            case "MOTHERBOARD": {
                const d = comp.Motherboard;
                if (d) {
                    specs["socket"] = d.socket;
                    specs["formFactor"] = d.formFactor;
                    specs["maxMemory"] = d.maxMemory;
                    specs["memorySlots"] = d.memorySlots;
                }
                break;
            }
            case "RAM": {
                const d = comp.Ram;
                if (d) {
                    specs["type"] = d.type ?? undefined;
                    specs["speed"] = d.speed ?? undefined;
                    specs["modules"] = d.modules;
                    specs["size"] = d.size;
                    specs["casLatency"] = d.casLatency;
                }
                break;
            }
            case "SSD": {
                const d = comp.Ssd;
                if (d) {
                    specs["capacity"] = d.capacity;
                    specs["cache"] = d.cache ?? undefined;
                    specs["interface"] = d.interface;
                    specs["formFactor"] = d.formFactor;
                }
                break;
            }
            case "HDD": {
                const d = comp.Hdd;
                if (d) {
                    specs["capacity"] = d.capacity;
                    specs["cache"] = d.cache ?? undefined;
                    specs["interface"] = d.interface;
                    specs["formFactor"] = d.formFactor;
                }
                break;
            }
            case "POWER_SUPPLY": {
                const d = comp.Psu;
                if (d) {
                    specs["type"] = d.type;
                    specs["wattage"] = d.wattage;
                    specs["efficiency"] = d.efficiency ?? undefined;
                    specs["modular"] = d.modular ?? undefined;
                }
                break;
            }
            case "CPU_COOLER": {
                const d = comp.CpuCooler;
                if (d) {
                    specs["rpmIdle"] = d.rpmIdle ?? undefined;
                    specs["rpmMax"] = d.rpmMax ?? undefined;
                    specs["noiseIdle"] = d.noiseIdle
                        ? Number(d.noiseIdle)
                        : undefined;
                    specs["noiseMax"] = d.noiseMax
                        ? Number(d.noiseMax)
                        : undefined;
                    specs["size"] = d.size ?? undefined;
                }
                break;
            }
            case "CASE": {
                const d = comp.Case;
                if (d) {
                    specs["type"] = d.type;
                    specs["sidePanel"] = d.sidePanel ?? undefined;
                    specs["volume"] = d.volume ? Number(d.volume) : undefined;
                    specs["bays3_5"] = d.bays3_5;
                }
                break;
            }
            case "CASE_FAN": {
                const d = comp.CaseFan;
                if (d) {
                    specs["size"] = d.size;
                    specs["rpmIdle"] = d.rpmIdle ?? undefined;
                    specs["rpmMax"] = d.rpmMax ?? undefined;
                    specs["noiseIdle"] = d.noiseIdle
                        ? Number(d.noiseIdle)
                        : undefined;
                    specs["noiseMax"] = d.noiseMax
                        ? Number(d.noiseMax)
                        : undefined;
                    specs["airflowIdle"] = d.airflowIdle
                        ? Number(d.airflowIdle)
                        : undefined;
                    specs["airflowMax"] = d.airflowMax
                        ? Number(d.airflowMax)
                        : undefined;
                }
                break;
            }
            case "SOUND_CARD": {
                const d = comp.SoundCard;
                if (d) {
                    specs["channels"] = d.channels;
                    specs["snr"] = d.snr ?? undefined;
                    specs["sampleRate"] = d.sampleRate ?? undefined;
                    specs["interface"] = d.interface;
                    specs["chipset"] = d.chipset ?? undefined;
                }
                break;
            }
            case "WIRELESS_NETWORK_CARD": {
                const d = comp.WirelessNetworkCard;
                if (d) {
                    specs["interface"] = d.interface;
                    specs["protocol"] = d.protocol;
                }
                break;
            }
        }

        (Object.keys(specs) as string[]).forEach((k) => {
            if (specs[k] === undefined) delete specs[k];
        });

        specs["price"] = c.price;

        return {
            id: c.id,
            title: c.title,
            price: c.price,
            imageSrc: c.images?.[0],
            componentType: comp.type.toLowerCase(),
            specs,
        };
    });
}
