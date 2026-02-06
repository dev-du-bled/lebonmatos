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
        const specs: Record<string, any> = {};

        specs["name"] = c.component?.name;
        specs["type"] = String(c.component?.type ?? "");

        if (c.component?.Cpu) {
            specs["coreCount"] = c.component.Cpu.coreCount;
            specs["coreClock"] = c.component.Cpu.coreClock;
            specs["boostClock"] = c.component.Cpu.boostClock;
            specs["tdp"] = c.component.Cpu.tdp;
        }

        if (c.component?.Gpu) {
            specs["chipset"] = c.component.Gpu.chipset;
            specs["memory"] = c.component.Gpu.memory;
            specs["boostClock"] = c.component.Gpu.boostClock;
        }

        if (c.component?.Ram) {
            specs["speed"] = c.component.Ram.speed;
            specs["size"] = c.component.Ram.size;
            specs["casLatency"] = c.component.Ram.casLatency;
        }

        if (c.component?.Ssd) {
            specs["capacity"] = c.component.Ssd.capacity;
            specs["interface"] = c.component.Ssd.interface;
        }

        if (c.component?.Hdd) {
            specs["capacity"] = c.component.Hdd.capacity;
            specs["interface"] = c.component.Hdd.interface;
        }

        if (c.component?.Psu) {
            specs["wattage"] = c.component.Psu.wattage;
            specs["efficiency"] = c.component.Psu.efficiency;
        }

        specs["price"] = c.price;

        return {
            id: c.id,
            title: c.title,
            price: c.price,
            imageSrc: c.images?.[0],
            componentType: String(c.component?.type ?? "").toLowerCase(),
            specs,
        };
    });
}
