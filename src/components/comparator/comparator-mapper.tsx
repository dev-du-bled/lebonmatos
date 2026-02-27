import { SelectedPost } from "@/components/configurator/component-selector";

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

        switch (c.component.type) {
            case "CPU":
                specs["microarch"] = c.component.Cpu?.microarch;
                specs["coreCount"] = c.component.Cpu?.coreCount;
                specs["coreClock"] = c.component.Cpu?.coreClock != null ? Number(c.component.Cpu.coreClock) : undefined;
                specs["boostClock"] = c.component.Cpu?.boostClock != null ? Number(c.component.Cpu.boostClock) : undefined;
                break;

            case "GPU":
                specs["chipset"] = c.component.Gpu?.chipset;
                specs["memory"] = c.component.Gpu?.memory;
                specs["coreClock"] = c.component.Gpu?.coreClock ?? undefined;
                specs["boostClock"] = c.component.Gpu?.boostClock ?? undefined;
                specs["length"] = c.component.Gpu?.length ?? undefined;
                break;

            case "MOTHERBOARD":
                specs["socket"] = c.component.Motherboard?.socket;
                specs["formFactor"] = c.component.Motherboard?.formFactor;
                specs["maxMemory"] = c.component.Motherboard?.maxMemory;
                specs["memorySlots"] = c.component.Motherboard?.memorySlots;
                break;

            case "RAM":
                specs["type"] = c.component.Ram?.type ?? undefined;
                specs["speed"] = c.component.Ram?.speed ?? undefined;
                specs["modules"] = c.component.Ram?.modules;
                specs["size"] = c.component.Ram?.size;
                specs["casLatency"] = c.component.Ram?.casLatency;
                break;

            case "SSD":
                specs["capacity"] = c.component.Ssd?.capacity;
                specs["cache"] = c.component.Ssd?.cache ?? undefined;
                specs["interface"] = c.component.Ssd?.interface;
                specs["formFactor"] = c.component.Ssd?.formFactor;
                break;

            case "HDD":
                specs["capacity"] = c.component.Hdd?.capacity;
                specs["cache"] = c.component.Hdd?.cache ?? undefined;
                specs["interface"] = c.component.Hdd?.interface;
                specs["formFactor"] = c.component.Hdd?.formFactor;
                break;

            case "POWER_SUPPLY":
                specs["type"] = c.component.Psu?.type;
                specs["wattage"] = c.component.Psu?.wattage;
                specs["efficiency"] = c.component.Psu?.efficiency ?? undefined;
                specs["modular"] = c.component.Psu?.modular ?? undefined;
                break;

            case "CPU_COOLER":
                specs["rpmIdle"] = c.component.CpuCooler?.rpmIdle ?? undefined;
                specs["rpmMax"] = c.component.CpuCooler?.rpmMax ?? undefined;
                specs["noiseIdle"] = c.component.CpuCooler?.noiseIdle != null ? Number(c.component.CpuCooler.noiseIdle) : undefined;
                specs["noiseMax"] = c.component.CpuCooler?.noiseMax != null ? Number(c.component.CpuCooler.noiseMax) : undefined;
                specs["size"] = c.component.CpuCooler?.size ?? undefined;
                break;

            case "CASE":
                specs["type"] = c.component.Case?.type;
                specs["sidePanel"] = c.component.Case?.sidePanel ?? undefined;
                specs["volume"] = c.component.Case?.volume != null ? Number(c.component.Case.volume) : undefined;
                specs["bays3_5"] = c.component.Case?.bays3_5;
                break;

            case "CASE_FAN":
                specs["size"] = c.component.CaseFan?.size;
                specs["rpmIdle"] = c.component.CaseFan?.rpmIdle ?? undefined;
                specs["rpmMax"] = c.component.CaseFan?.rpmMax ?? undefined;
                specs["noiseIdle"] = c.component.CaseFan?.noiseIdle != null ? Number(c.component.CaseFan.noiseIdle) : undefined;
                specs["noiseMax"] = c.component.CaseFan?.noiseMax != null ? Number(c.component.CaseFan.noiseMax) : undefined;
                specs["airflowIdle"] = c.component.CaseFan?.airflowIdle != null ? Number(c.component.CaseFan.airflowIdle) : undefined;
                specs["airflowMax"] = c.component.CaseFan?.airflowMax != null ? Number(c.component.CaseFan.airflowMax) : undefined;
                break;

            case "SOUND_CARD":
                specs["channels"] = c.component.SoundCard?.channels;
                specs["snr"] = c.component.SoundCard?.snr ?? undefined;
                specs["sampleRate"] = c.component.SoundCard?.sampleRate ?? undefined;
                specs["interface"] = c.component.SoundCard?.interface;
                specs["chipset"] = c.component.SoundCard?.chipset ?? undefined;
                break;

            case "WIRELESS_NETWORK_CARD":
                specs["interface"] = c.component.WirelessNetworkCard?.interface;
                specs["protocol"] = c.component.WirelessNetworkCard?.protocol;
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
            componentType: c.component.type?.toLowerCase(),
            specs,
        };
    });
}
