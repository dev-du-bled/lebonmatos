import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ComponentWithDetails } from "./compatibility";

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

    return "";
}
