import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ComponentWithDetails } from "./compatibility";
import { SelectedPost } from "@/components/configurator/component-selector";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatComponentDetails(
    component: ComponentWithDetails
): string {
    if (component.Motherboard) {
        const mb = component.Motherboard;
        return `${mb.socket} | ${mb.formFactor} | ${mb.memorySlots} slots | ${mb.maxMemory} Go`;
    }

    if (component.Cpu) {
        const cpu = component.Cpu;
        const parts = [cpu.microarch];
        if (cpu.coreCount) parts.push(`${cpu.coreCount} cœurs`);
        if (cpu.coreClock) parts.push(`${cpu.coreClock} GHz`);
        if (cpu.boostClock) parts.push(`${cpu.boostClock} GHz (boost)`);
        return parts.join(" | ");
    }

    if (component.Ram) {
        const ram = component.Ram;
        const parts = [];
        if (ram.type) parts.push(ram.type);
        parts.push(`${ram.modules}x${ram.size / ram.modules}Go`);
        if (ram.speed) parts.push(`${ram.speed} MHz`);
        return parts.join(" | ");
    }

    if (component.Gpu) {
        const gpu = component.Gpu;
        const parts = [gpu.chipset, `${gpu.memory} Go`];
        if (gpu.coreClock) parts.push(`${gpu.coreClock} MHz`);
        if (gpu.boostClock) parts.push(`${gpu.boostClock} MHz (boost)`);
        if (gpu.length) parts.push(`${gpu.length} mm`);
        return parts.join(" | ");
    }

    if (component.Psu) {
        const psu = component.Psu;
        const parts = [`${psu.wattage} W`];
        if (psu.efficiency) parts.push(psu.efficiency);
        if (psu.modular) parts.push(psu.modular);
        return parts.join(" | ");
    }

    if (component.Case) {
        const cas = component.Case;
        const parts = [cas.type];
        if (cas.sidePanel) parts.push(cas.sidePanel);
        if (cas.volume) parts.push(`${cas.volume} L`);
        parts.push(`${cas.bays3_5} baies 3.5"`);
        return parts.join(" | ");
    }

    if (component.Hdd) {
        const hdd = component.Hdd;
        return `${hdd.capacity} Go | ${hdd.rpm} RPM | ${hdd.cache} Mo | ${hdd.formFactor}"`;
    }

    if (component.Ssd) {
        const ssd = component.Ssd;
        return `${ssd.capacity} Go | ${ssd.cache} Mo | ${ssd.interface} | ${ssd.formFactor}`;
    }

    if (component.CpuCooler) {
        const cooler = component.CpuCooler;
        const parts = [`${cooler.size} mm`];
        if (cooler.rpmIdle) parts.push(`${cooler.rpmIdle} RPM (idle)`);
        if (cooler.rpmMax) parts.push(`${cooler.rpmMax} RPM (max)`);
        if (cooler.noiseIdle) parts.push(`${cooler.noiseIdle} dB (idle)`);
        if (cooler.noiseMax) parts.push(`${cooler.noiseMax} dB (max)`);
        return parts.join(" | ");
    }

    if (component.CaseFan) {
        const fan = component.CaseFan;
        const parts = [`${fan.size} mm`];
        if (fan.rpmIdle) parts.push(`${fan.rpmIdle} RPM (idle)`);
        if (fan.rpmMax) parts.push(`${fan.rpmMax} RPM (max)`);
        if (fan.noiseIdle) parts.push(`${fan.noiseIdle} dB (idle)`);
        if (fan.noiseMax) parts.push(`${fan.noiseMax} dB (max)`);
        if (fan.airFlowIdle) parts.push(`${fan.airFlowIdle} CFM (idle)`);
        if (fan.airFlowMax) parts.push(`${fan.airFlowMax} CFM (max)`);
        if (fan.pwm !== null) parts.push(fan.pwm ? "PWM" : "Non-PWM");
        return parts.join(" | ");
    }

    if (component.SoundCard) {
        const sc = component.SoundCard;
        const parts = [`${sc.channels} canaux`];
        if (sc.sampleRate) parts.push(`${sc.sampleRate} Hz`);
        if (sc.chipset) parts.push(sc.chipset);
        if (sc.interface) parts.push(sc.interface);
        return parts.join(" | ");
    }

    if (component.WirelessNetworkCard) {
        const wnc = component.WirelessNetworkCard;
        const parts = [];
        if (wnc.interface) parts.push(wnc.interface);
        if (wnc.protocol) parts.push(wnc.protocol);
        return parts.join(" | ");
    }

    return "";
}

// map meilisearch hit to SelectedPost, handling component details
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapHitToSelectedPost(hit: any): SelectedPost {
    const component: ComponentWithDetails = {
        id: hit.componentId || hit.id,
        type: hit.componentType,
        name: hit.componentName,
    };

    switch (component.type) {
        case "CPU":
            component.Cpu = {
                microarch: hit.microarch,
                coreClock: hit.coreClock,
                boostClock: hit.boostClock ?? null,
                coreCount: hit.coreCount,
            };
            break;
        case "MOTHERBOARD":
            component.Motherboard = {
                socket: hit.socket,
                formFactor: hit.formFactor,
                memorySlots: hit.memorySlots,
                maxMemory: hit.maxMemory,
            };
            break;
        case "RAM":
            component.Ram = {
                type: hit.ramType ?? null,
                modules: hit.modules,
                size: hit.size,
                speed: hit.speed ?? null,
            };
            break;
        case "GPU":
            component.Gpu = {
                coreClock: hit.coreClock ?? null,
                boostClock: hit.boostClock ?? null,
                chipset: hit.chipset,
                memory: hit.memory,
                length: hit.length ?? null,
            };
            break;
        case "POWER_SUPPLY":
            component.Psu = {
                wattage: hit.wattage,
                efficiency: hit.efficiency ?? null,
                modular: hit.modular ?? null,
            };
            break;
        case "CASE":
            component.Case = {
                type: hit.caseType,
                sidePanel: hit.sidePanel ?? null,
                volume: hit.volume ?? null,
                bays3_5: hit.bays3_5,
            };
            break;
        case "HDD":
            component.Hdd = {
                capacity: hit.capacity,
                rpm: hit.rpm,
                cache: hit.cache,
                formFactor: hit.formFactor,
            };
            break;
        case "SSD":
            component.Ssd = {
                capacity: hit.capacity,
                cache: hit.cache,
                interface: hit.interface,
                formFactor: hit.formFactor,
            };
            break;
        case "CPU_COOLER":
            component.CpuCooler = {
                rpmIdle: hit.rpmIdle,
                rpmMax: hit.rpmMax,
                noiseIdle: hit.noiseIdle,
                noiseMax: hit.noiseMax,
                size: hit.size,
            };
            break;
        case "CASE_FAN":
            component.CaseFan = {
                size: hit.size,
                rpmIdle: hit.rpmIdle,
                rpmMax: hit.rpmMax,
                noiseIdle: hit.noiseIdle,
                noiseMax: hit.noiseMax,
                airFlowIdle: hit.airFlowIdle,
                airFlowMax: hit.airFlowMax,
                pwm: hit.pwm,
            };
            break;
        case "SOUND_CARD":
            component.SoundCard = {
                channels: hit.channels,
                sampleRate: hit.sampleRate,
                chipset: hit.chipset,
                interface: hit.interface,
            };
            break;
        case "WIRELESS_NETWORK_CARD":
            component.WirelessNetworkCard = {
                interface: hit.interface,
                protocol: hit.protocol,
            };
            break;
        default:
            break;
    }

    return {
        id: hit.id,
        title: hit.title,
        price: hit.price,
        images: hit.images,
        component,
    };
}
