import { PrismaClient, ComponentType } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import cpu from "../../data/cpu.json";
import mb from "../../data/motherboard.json";
import ram from "../../data/memory.json";
import disk from "../../data/internal-hard-drive.json";
import gpu from "../../data/video-card.json";
import psu from "../../data/power-supply.json";
import cpucooler from "../../data/cpu-cooler.json";
import soundCard from "../../data/sound-card.json";
import caseFan from "../../data/case-fan.json";
import cases from "../../data/case.json";
import netCard from "../../data/wireless-network-card.json";

import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd(), true);

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString, max: 30 });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function getExistingNames(type: ComponentType): Promise<Set<string>> {
    const existing = await prisma.component.findMany({
        where: { type },
        select: { name: true },
    });
    return new Set(existing.map((c) => c.name));
}

async function runWithConcurrency(tasks: (() => Promise<void>)[], limit = 5) {
    const executing = new Set<Promise<void>>();
    for (const task of tasks) {
        const p = task().then(() => {
            executing.delete(p);
        });
        executing.add(p);
        if (executing.size >= limit) {
            await Promise.race(executing);
        }
    }
    await Promise.all(executing);
}

async function main() {
    const startTime = Date.now();

    // Fetch all existing names in parallel
    const [
        existingCpu,
        existingMb,
        existingRam,
        existingSsd,
        existingHdd,
        existingGpu,
        existingPsu,
        existingCpuCooler,
        existingSoundCard,
        existingCase,
        existingNetCard,
        existingCaseFan,
    ] = await Promise.all([
        getExistingNames(ComponentType.CPU),
        getExistingNames(ComponentType.MOTHERBOARD),
        getExistingNames(ComponentType.RAM),
        getExistingNames(ComponentType.SSD),
        getExistingNames(ComponentType.HDD),
        getExistingNames(ComponentType.GPU),
        getExistingNames(ComponentType.POWER_SUPPLY),
        getExistingNames(ComponentType.CPU_COOLER),
        getExistingNames(ComponentType.SOUND_CARD),
        getExistingNames(ComponentType.CASE),
        getExistingNames(ComponentType.WIRELESS_NETWORK_CARD),
        getExistingNames(ComponentType.CASE_FAN),
    ]);

    const tasks: (() => Promise<void>)[] = [
        () => addCpu(existingCpu),
        () => addMb(existingMb),
        () => addRam(existingRam),
        () => addDisk(existingSsd, existingHdd),
        () => addGpu(existingGpu),
        () => addPsu(existingPsu),
        () => addCpuCooler(existingCpuCooler),
        () => addSoundCard(existingSoundCard),
        () => addCase(existingCase),
        () => addNetCard(existingNetCard),
        () => addCaseFan(existingCaseFan),
    ];

    await runWithConcurrency(tasks, 5);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`Seeding completed in ${elapsed}s`);
}

async function addCpu(existing: Set<string>) {
    const toAdd = cpu.filter((c) => !existing.has(c.name));
    console.log(`Adding CPUs (${toAdd.length} new, ${existing.size} existing)`);
    if (toAdd.length === 0) return;

    const items = toAdd.map((c) => ({
        id: crypto.randomUUID(),
        raw: c,
    }));

    await prisma.component.createMany({
        data: items.map((i) => ({
            id: i.id,
            name: i.raw.name,
            estimatedPrice: i.raw.price,
            color: null,
            type: ComponentType.CPU,
        })),
    });

    await prisma.cpu.createMany({
        data: items.map((i) => ({
            componentId: i.id,
            coreCount: i.raw.core_count,
            coreClock: i.raw.core_clock,
            boostClock: i.raw.boost_clock,
            microarch: i.raw.microarchitecture,
            tdp: i.raw.tdp,
            graphics: i.raw.graphics,
        })),
    });
}

async function addMb(existing: Set<string>) {
    const toAdd = mb.filter((m) => !existing.has(m.name));
    console.log(
        `Adding Motherboards (${toAdd.length} new, ${existing.size} existing)`
    );
    if (toAdd.length === 0) return;

    const items = toAdd.map((m) => ({
        id: crypto.randomUUID(),
        raw: m,
    }));

    await prisma.component.createMany({
        data: items.map((i) => ({
            id: i.id,
            name: i.raw.name,
            estimatedPrice: i.raw.price,
            color: i.raw.color,
            type: ComponentType.MOTHERBOARD,
        })),
    });

    await prisma.motherboard.createMany({
        data: items.map((i) => ({
            componentId: i.id,
            socket: i.raw.socket,
            formFactor: i.raw.form_factor,
            maxMemory: i.raw.max_memory,
            memorySlots: i.raw.memory_slots,
        })),
    });
}

async function addRam(existing: Set<string>) {
    const toAdd = ram.filter((r) => !existing.has(r.name));
    console.log(`Adding RAM (${toAdd.length} new, ${existing.size} existing)`);
    if (toAdd.length === 0) return;

    const items = toAdd.map((r) => ({
        id: crypto.randomUUID(),
        raw: r,
    }));

    await prisma.component.createMany({
        data: items.map((i) => ({
            id: i.id,
            name: i.raw.name,
            estimatedPrice: i.raw.price,
            color: null,
            type: ComponentType.RAM,
        })),
    });

    await prisma.ram.createMany({
        data: items.map((i) => ({
            componentId: i.id,
            type: i.raw.speed[0] ? `DDR${i.raw.speed[0]}` : null,
            speed: i.raw.speed[1] ?? null,
            modules: i.raw.modules[0],
            size: i.raw.modules[1],
            casLatency: i.raw.cas_latency,
        })),
    });
}

async function addDisk(existingSsd: Set<string>, existingHdd: Set<string>) {
    const toAdd = disk.filter((d) =>
        d.type === "SSD" ? !existingSsd.has(d.name) : !existingHdd.has(d.name)
    );
    console.log(
        `Adding Disks (${toAdd.length} new, ${existingSsd.size + existingHdd.size} existing)`
    );
    if (toAdd.length === 0) return;

    const ssdItems = toAdd
        .filter((d) => d.type === "SSD")
        .map((d) => ({ id: crypto.randomUUID(), raw: d }));
    const hddItems = toAdd
        .filter((d) => d.type !== "SSD")
        .map((d) => ({ id: crypto.randomUUID(), raw: d }));

    if (ssdItems.length > 0) {
        await prisma.component.createMany({
            data: ssdItems.map((i) => ({
                id: i.id,
                name: i.raw.name,
                estimatedPrice: i.raw.price ?? null,
                color: i.raw.color,
                type: ComponentType.SSD,
            })),
        });

        await prisma.ssd.createMany({
            data: ssdItems.map((i) => ({
                componentId: i.id,
                capacity: i.raw.capacity,
                cache: i.raw.cache,
                interface: i.raw.interface,
                formFactor:
                    typeof i.raw.form_factor === "number"
                        ? i.raw.form_factor.toString()
                        : i.raw.form_factor,
            })),
        });
    }

    if (hddItems.length > 0) {
        await prisma.component.createMany({
            data: hddItems.map((i) => ({
                id: i.id,
                name: i.raw.name,
                estimatedPrice: i.raw.price ?? null,
                color: i.raw.color,
                type: ComponentType.HDD,
            })),
        });

        await prisma.hdd.createMany({
            data: hddItems.map((i) => ({
                componentId: i.id,
                capacity: i.raw.capacity,
                cache: i.raw.cache,
                interface: i.raw.interface,
                formFactor:
                    typeof i.raw.form_factor === "number"
                        ? i.raw.form_factor.toString()
                        : i.raw.form_factor,
            })),
        });
    }
}

async function addGpu(existing: Set<string>) {
    const toAdd = gpu.filter((g) => !existing.has(g.name));
    console.log(`Adding GPUs (${toAdd.length} new, ${existing.size} existing)`);
    if (toAdd.length === 0) return;

    const items = toAdd.map((g) => ({
        id: crypto.randomUUID(),
        raw: g,
    }));

    await prisma.component.createMany({
        data: items.map((i) => ({
            id: i.id,
            name: i.raw.name,
            estimatedPrice: i.raw.price,
            color: i.raw.color,
            type: ComponentType.GPU,
        })),
    });

    await prisma.gpu.createMany({
        data: items.map((i) => ({
            componentId: i.id,
            chipset: i.raw.chipset,
            memory: i.raw.memory,
            coreClock: i.raw.core_clock,
            boostClock: i.raw.boost_clock,
            length: i.raw.length,
        })),
    });
}

async function addPsu(existing: Set<string>) {
    const toAdd = psu.filter((p) => !existing.has(p.name));
    console.log(`Adding PSUs (${toAdd.length} new, ${existing.size} existing)`);
    if (toAdd.length === 0) return;

    const items = toAdd.map((p) => ({
        id: crypto.randomUUID(),
        raw: p,
    }));

    await prisma.component.createMany({
        data: items.map((i) => ({
            id: i.id,
            name: i.raw.name,
            estimatedPrice: i.raw.price,
            color: i.raw.color ?? null,
            type: ComponentType.POWER_SUPPLY,
        })),
    });

    await prisma.psu.createMany({
        data: items.map((i) => ({
            componentId: i.id,
            type: i.raw.type,
            wattage: i.raw.wattage,
            efficiency: i.raw.efficiency,
            modular: i.raw.modular !== false ? i.raw.modular : null,
        })),
    });
}

async function addCpuCooler(existing: Set<string>) {
    const toAdd = cpucooler.filter((c) => !existing.has(c.name));
    console.log(
        `Adding CPU Coolers (${toAdd.length} new, ${existing.size} existing)`
    );
    if (toAdd.length === 0) return;

    const items = toAdd.map((c) => ({
        id: crypto.randomUUID(),
        raw: c,
    }));

    await prisma.component.createMany({
        data: items.map((i) => ({
            id: i.id,
            name: i.raw.name,
            estimatedPrice: i.raw.price,
            color: i.raw.color ?? null,
            type: ComponentType.CPU_COOLER,
        })),
    });

    await prisma.cpuCooler.createMany({
        data: items.map((i) => {
            const isRpmArray = Array.isArray(i.raw.rpm);
            const isNoiseArray = Array.isArray(i.raw.noise_level);
            return {
                componentId: i.id,
                rpmIdle: isRpmArray ? i.raw.rpm[0] : null,
                rpmMax: isRpmArray ? i.raw.rpm[1] : i.raw.rpm,
                noiseIdle: isNoiseArray
                    ? i.raw.noise_level[0].toFixed(1)
                    : null,
                noiseMax: isNoiseArray
                    ? i.raw.noise_level[1].toFixed(1)
                    : typeof i.raw.noise_level === "number"
                      ? i.raw.noise_level.toFixed(1)
                      : null,
                size: i.raw.size,
            };
        }),
    });
}

async function addSoundCard(existing: Set<string>) {
    const toAdd = soundCard.filter((s) => !existing.has(s.name));
    console.log(
        `Adding Sound Cards (${toAdd.length} new, ${existing.size} existing)`
    );
    if (toAdd.length === 0) return;

    const items = toAdd.map((s) => ({
        id: crypto.randomUUID(),
        raw: s,
    }));

    await prisma.component.createMany({
        data: items.map((i) => ({
            id: i.id,
            name: i.raw.name,
            estimatedPrice: i.raw.price,
            color: null,
            type: ComponentType.SOUND_CARD,
        })),
    });

    await prisma.soundCard.createMany({
        data: items.map((i) => ({
            componentId: i.id,
            channels: i.raw.channels,
            digitalAudio: i.raw.digital_audio,
            snr: i.raw.snr,
            sampleRate: i.raw.sample_rate,
            chipset: i.raw.chipset ?? null,
            interface: i.raw.interface,
        })),
    });
}

async function addCaseFan(existing: Set<string>) {
    const toAdd = caseFan.filter((c) => !existing.has(c.name));
    console.log(
        `Adding Case Fans (${toAdd.length} new, ${existing.size} existing)`
    );
    if (toAdd.length === 0) return;

    const items = toAdd.map((c) => ({
        id: crypto.randomUUID(),
        raw: c,
    }));

    await prisma.component.createMany({
        data: items.map((i) => ({
            id: i.id,
            name: i.raw.name,
            estimatedPrice: i.raw.price,
            color: i.raw.color,
            type: ComponentType.CASE_FAN,
        })),
    });

    await prisma.caseFan.createMany({
        data: items.map((i) => {
            const isRpmArray = Array.isArray(i.raw.rpm);
            const isAirflowArray = Array.isArray(i.raw.airflow);
            const isNoiseArray = Array.isArray(i.raw.noise_level);
            return {
                componentId: i.id,
                size: i.raw.size,
                rpmIdle: isRpmArray ? (i.raw.rpm as number[])[0] : null,
                rpmMax: isRpmArray
                    ? (i.raw.rpm as number[])[1]
                    : (i.raw.rpm as number),
                airflowIdle: isAirflowArray
                    ? (i.raw.airflow as number[])[0].toFixed(1)
                    : null,
                airflowMax: isAirflowArray
                    ? (i.raw.airflow as number[])[1].toFixed(1)
                    : typeof i.raw.airflow === "number"
                      ? i.raw.airflow.toFixed(1)
                      : null,
                noiseIdle: isNoiseArray
                    ? (i.raw.noise_level as number[])[0].toFixed(1)
                    : null,
                noiseMax: isNoiseArray
                    ? (i.raw.noise_level as number[])[1].toFixed(1)
                    : typeof i.raw.noise_level === "number"
                      ? i.raw.noise_level.toFixed(1)
                      : null,
                pwm: i.raw.pwm,
            };
        }),
    });
}

async function addCase(existing: Set<string>) {
    const toAdd = cases.filter((c) => !existing.has(c.name));
    console.log(
        `Adding Cases (${toAdd.length} new, ${existing.size} existing)`
    );
    if (toAdd.length === 0) return;

    const items = toAdd.map((c) => ({
        id: crypto.randomUUID(),
        raw: c,
    }));

    await prisma.component.createMany({
        data: items.map((i) => ({
            id: i.id,
            name: i.raw.name,
            estimatedPrice: i.raw.price,
            color: i.raw.color,
            type: ComponentType.CASE,
        })),
    });

    await prisma.case.createMany({
        data: items.map((i) => ({
            componentId: i.id,
            type: i.raw.type,
            sidePanel: i.raw.side_panel,
            volume: i.raw.external_volume
                ? parseFloat(i.raw.external_volume)
                : null,
            bays3_5: i.raw.internal_35_bays,
        })),
    });
}

async function addNetCard(existing: Set<string>) {
    const toAdd = netCard.filter((n) => !existing.has(n.name));
    console.log(
        `Adding Network Cards (${toAdd.length} new, ${existing.size} existing)`
    );
    if (toAdd.length === 0) return;

    const items = toAdd.map((n) => ({
        id: crypto.randomUUID(),
        raw: n,
    }));

    await prisma.component.createMany({
        data: items.map((i) => ({
            id: i.id,
            name: i.raw.name,
            estimatedPrice: i.raw.price,
            color: null,
            type: ComponentType.WIRELESS_NETWORK_CARD,
        })),
    });

    await prisma.wirelessNetworkCard.createMany({
        data: items.map((i) => ({
            componentId: i.id,
            interface: i.raw.interface,
            protocol: i.raw.protocol,
        })),
    });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
