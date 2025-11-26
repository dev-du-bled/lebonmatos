import { PrismaClient, ComponentType } from "@prisma/client";
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

const prisma = new PrismaClient();

async function main() {
    await addCpu();
    await addMb();
    await addRam();
    await addDisk();
    await addGpu();
    await addPsu();
    await addCpuCooler();
    await addSoundCard();
    await addCase();
    await addNetCard();
    await addCaseFan();
}

async function addCpu() {
    console.log("Adding CPUs");
    await Promise.all(
        cpu.map((c) =>
            prisma.component.create({
                data: {
                    name: c.name,
                    estimatedPrice: c.price,
                    color: null,
                    type: ComponentType.CPU,
                    Cpu: {
                        create: {
                            coreCount: c.core_count,
                            coreClock: c.core_clock,
                            boostClock: c.boost_clock,
                            microarch: c.microarchitecture,
                            tdp: c.tdp,
                            graphics: c.graphics,
                        },
                    },
                },
            })
        )
    );
}

async function addMb() {
    console.log("Adding Motherboards");
    await Promise.all(
        mb.map((m) =>
            prisma.component.create({
                data: {
                    name: m.name,
                    estimatedPrice: m.price,
                    color: m.color,
                    type: ComponentType.MOTHERBOARD,
                    Motherboard: {
                        create: {
                            socket: m.socket,
                            formFactor: m.form_factor,
                            maxMemory: m.max_memory,
                            memorySlots: m.memory_slots,
                        },
                    },
                },
            })
        )
    );
}

async function addRam() {
    console.log("Adding RAM");
    await Promise.all(
        ram.map((r) =>
            prisma.component.create({
                data: {
                    name: r.name,
                    estimatedPrice: r.price,
                    color: null,
                    type: ComponentType.RAM,
                    Ram: {
                        create: {
                            type: r.speed[0] ? `DDR${r.speed[0]}` : null,
                            speed: r.speed[1] ?? null,
                            modules: r.modules[0],
                            size: r.modules[1],
                            casLatency: r.cas_latency,
                        },
                    },
                },
            })
        )
    );
}

async function addDisk() {
    console.log("Adding Disks");
    await Promise.all(
        disk.map((d) => {
            const data = {
                capacity: d.capacity,
                cache: d.cache,
                interface: d.interface,
                formFactor: d.form_factor,
            };

            if (typeof d.form_factor === "number") {
                data.formFactor = d.form_factor.toString();
            }

            if (d.type === "SSD") {
                return prisma.component.create({
                    data: {
                        name: d.name,
                        estimatedPrice: d.price ?? null,
                        color: d.color,
                        type: ComponentType.SSD,
                        Ssd: {
                            create: data,
                        },
                    },
                });
            } else {
                return prisma.component.create({
                    data: {
                        name: d.name,
                        estimatedPrice: d.price ?? null,
                        color: d.color,
                        type: ComponentType.HDD,
                        Hdd: {
                            create: data,
                        },
                    },
                });
            }
        })
    );
}

async function addGpu() {
    console.log("Adding GPUs");
    await Promise.all(
        gpu.map((g) =>
            prisma.component.create({
                data: {
                    name: g.name,
                    estimatedPrice: g.price,
                    color: g.color,
                    type: ComponentType.GPU,
                    Gpu: {
                        create: {
                            chipset: g.chipset,
                            memory: g.memory,
                            coreClock: g.core_clock,
                            boostClock: g.boost_clock,
                            length: g.length,
                        },
                    },
                },
            })
        )
    );
}

async function addPsu() {
    console.log("Adding PSUs");
    await Promise.all(
        psu.map((p) =>
            prisma.component.create({
                data: {
                    name: p.name,
                    estimatedPrice: p.price,
                    color: p.color ?? null,
                    type: ComponentType.POWER_SUPPLY,
                    Psu: {
                        create: {
                            type: p.type,
                            wattage: p.wattage,
                            efficiency: p.efficiency,
                            modular: p.modular !== false ? p.modular : null,
                        },
                    },
                },
            })
        )
    );
}

async function addCpuCooler() {
    console.log("Adding CPU Coolers");
    await Promise.all(
        cpucooler.map((c) => {
            const isRpmArray = Array.isArray(c.rpm);
            const isNoiseArray = Array.isArray(c.noise_level);

            const data = {
                rpmIdle: isRpmArray ? c.rpm[0] : null,
                rpmMax: isRpmArray ? c.rpm[1] : c.rpm,
                noiseIdle: isNoiseArray ? c.noise_level[0].toFixed(1) : null,
                noiseMax: isNoiseArray
                    ? c.noise_level[1].toFixed(1)
                    : typeof c.noise_level === "number"
                      ? c.noise_level.toFixed(1)
                      : null,
            };

            return prisma.component.create({
                data: {
                    name: c.name,
                    estimatedPrice: c.price,
                    color: c.color ?? null,
                    type: ComponentType.CPU_COOLER,
                    CpuCooler: {
                        create: {
                            ...data,
                            size: c.size,
                        },
                    },
                },
            });
        })
    );
}

async function addSoundCard() {
    console.log("Adding Sound Cards");
    await Promise.all(
        soundCard.map((s) =>
            prisma.component.create({
                data: {
                    name: s.name,
                    estimatedPrice: s.price,
                    color: null,
                    type: ComponentType.SOUND_CARD,
                    SoundCard: {
                        create: {
                            channels: s.channels,
                            digitalAudio: s.digital_audio,
                            snr: s.snr,
                            sampleRate: s.sample_rate,
                            chipset: s.chipset ?? null,
                            interface: s.interface,
                        },
                    },
                },
            })
        )
    );
}

async function addCaseFan() {
    console.log("Adding Case Fans");
    await Promise.all(
        caseFan.map((c) => {
            const isRpmArray = Array.isArray(c.rpm);
            const isAirflowArray = Array.isArray(c.airflow);
            const isNoiseArray = Array.isArray(c.noise_level);

            const data = {
                rpmIdle: isRpmArray ? (c.rpm as number[])[0] : null,
                rpmMax: isRpmArray ? (c.rpm as number[])[1] : (c.rpm as number),
                airflowIdle: isAirflowArray
                    ? (c.airflow as number[])[0].toFixed(1)
                    : null,
                airflowMax: isAirflowArray
                    ? (c.airflow as number[])[1].toFixed(1)
                    : typeof c.airflow === "number"
                      ? c.airflow.toFixed(1)
                      : null,
                noiseIdle: isNoiseArray
                    ? (c.noise_level as number[])[0].toFixed(1)
                    : null,
                noiseMax: isNoiseArray
                    ? (c.noise_level as number[])[1].toFixed(1)
                    : typeof c.noise_level === "number"
                      ? c.noise_level.toFixed(1)
                      : null,
            };

            return prisma.component.create({
                data: {
                    name: c.name,
                    estimatedPrice: c.price,
                    color: c.color,
                    type: ComponentType.CASE_FAN,
                    CaseFan: {
                        create: {
                            size: c.size,
                            ...data,
                            pwm: c.pwm,
                        },
                    },
                },
            });
        })
    );
}

async function addCase() {
    console.log("Adding Cases");
    await Promise.all(
        cases.map((c) =>
            prisma.component.create({
                data: {
                    name: c.name,
                    estimatedPrice: c.price,
                    color: c.color,
                    type: ComponentType.CASE,
                    Case: {
                        create: {
                            type: c.type,
                            sidePanel: c.side_panel,
                            volume: c.external_volume
                                ? parseFloat(c.external_volume)
                                : null,
                            bays3_5: c.internal_35_bays,
                        },
                    },
                },
            })
        )
    );
}

async function addNetCard() {
    console.log("Adding Network Cards");
    await Promise.all(
        netCard.map((n) =>
            prisma.component.create({
                data: {
                    name: n.name,
                    estimatedPrice: n.price,
                    color: null,
                    type: ComponentType.WIRELESS_NETWORK_CARD,
                    WirelessNetworkCard: {
                        create: {
                            interface: n.interface,
                            protocol: n.protocol,
                        },
                    },
                },
            })
        )
    );
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
