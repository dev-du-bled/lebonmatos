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

    if (component.Hdd) {
        const hdd = component.Hdd;
        return `${hdd.capacity} Go | ${hdd.cache} Mo | ${hdd.formFactor}"`;
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
        if (fan.airflowIdle) parts.push(`${fan.airflowIdle} CFM (idle)`);
        if (fan.airflowMax) parts.push(`${fan.airflowMax} CFM (max)`);
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
