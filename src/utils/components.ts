import {
    Cpu,
    Gpu,
    Ram,
    Motherboard,
    Hdd,
    Ssd,
    Psu,
    Case,
    CaseFan,
    CpuCooler,
    SoundCard,
    WirelessNetworkCard,
    ComponentType,
} from "@prisma/client";

export type ReturnedComponent<T = unknown> = {
    id: string;
    name: string;
    type: ComponentType;
    price: number | null;
    color: string | null;
    data: T;
};

export type Components =
    | Cpu
    | Gpu
    | Ram
    | Motherboard
    | Hdd
    | Ssd
    | Psu
    | Case
    | CaseFan
    | CpuCooler
    | SoundCard
    | WirelessNetworkCard;

// loop over the entries of the data object and format them into a string to display on ui
export function formatComponentData(type: ComponentType, data: Components) {
    const entries = Object.keys(data as Record<string, unknown>);

    const displayMapping: Record<
        ComponentType,
        Record<string, string | null>
    > = {
        CPU: displayCpu(data as Cpu),
        GPU: displayGpu(data as Gpu),
        MOTHERBOARD: displayMotherboard(data as Motherboard),
        RAM: displayRam(data as Ram),
        SSD: displaySsd(data as Ssd),
        HDD: displayHdd(data as Hdd),
        POWER_SUPPLY: displayPsu(data as Psu),
        CPU_COOLER: displayCpuCooler(data as CpuCooler),
        CASE: displayCase(data as Case),
        CASE_FAN: displayCaseFan(data as CaseFan),
        SOUND_CARD: displaySoundCard(data as SoundCard),
        WIRELESS_NETWORK_CARD: displayWirelessNetworkCard(
            data as WirelessNetworkCard
        ),
    };

    const mapping = displayMapping[type];

    const formattedData = entries.map((key) => {
        if (key === "id" || key === "componentId") return null;
        if ((data as Record<string, unknown>)[key] === null) return null;
        const displayKey = mapping[key];
        if (!displayKey) return null;

        return displayKey;
    });

    return formattedData;
}

const displayCpu = (data: Cpu) => ({
    coreCount: `Cœurs: ${data.coreCount}`,
    coreClock: `Fréquence de Base: ${data.coreClock} GHz`,
    boostClock: `Fréquence Turbo: ${data.boostClock} GHz`,
    microarch: `Architecture: ${data.microarch}`,
    tdp: `TDP: ${data.tdp} W`,
    graphics: `iGPU: ${data.graphics || "Pas de GPU intégré"}`,
});

const displayGpu = (data: Gpu) => ({
    chipset: `Chipset: ${data.chipset}`,
    memory: `Mémoire: ${data.memory} Go`,
    coreClock: `Fréquence de Base: ${data.coreClock} MHz`,
    boostClock: `Fréquence Turbo: ${data.boostClock} MHz`,
    length: `Longueur: ${data.length} mm`,
});

const displayMotherboard = (data: Motherboard) => ({
    socket: `Socket: ${data.socket}`,
    formFactor: `Facteur de forme: ${data.formFactor}`,
    maxMemory: `Mémoire maximale: ${data.maxMemory} Go`,
    memorySlots: `Emplacements mémoire: ${data.memorySlots}`,
});

const displayRam = (data: Ram) => ({
    type: `Type: ${data.type}`,
    speed: `Vitesse: ${data.speed} MHz`,
    modules: `Modules: ${data.modules} x`,
    size: `Taille: ${data.size} Go`,
    casLatency: `Latence: CL${data.casLatency}`,
});

const displaySsd = (data: Ssd) => ({
    capacity: `Capacité: ${data.capacity} Go`,
    cache: `Cache: ${data.cache} Mo`,
    interface: `Interface: ${data.interface}`,
    formFactor: `Format: ${data.formFactor}`,
});

const displayHdd = (data: Hdd) => ({
    capacity: `Capacité: ${data.capacity} Go`,
    cache: `Cache: ${data.cache} Mo`,
    formFactor: `Format: ${data.formFactor}`,
    interface: `Interface: ${data.interface}`,
});

const displayPsu = (data: Psu) => ({
    type: `Type: ${data.type}`,
    wattage: `Wattage: ${data.wattage} W`,
    efficiency: `Efficacité: ${data.efficiency}`,
    modular: `Modulaire: ${data.modular}`,
});

const displayCpuCooler = (data: CpuCooler) => ({
    rpmIdle: `Tours/min (Idle): ${data.rpmIdle}`,
    rpmMax: `Tours/min (Max): ${data.rpmMax}`,
    noiseIdle: `Bruit (Idle) dB: ${data.noiseIdle}`,
    noiseMax: `Bruit (Max) dB: ${data.noiseMax}`,
    size: `Taille: ${data.size}`,
});

const displayCase = (data: Case) => ({
    type: `Type: ${data.type}`,
    sidePanel: `Panneau latéral: ${data.sidePanel}`,
    volume: `Volume: ${data.volume}`,
    bays3_5: `Baies 3.5": ${data.bays3_5}`,
});

const displayCaseFan = (data: CaseFan) => ({
    size: `Taille: ${data.size} mm`,
    rpmIdle: `Tours/min (Idle): ${data.rpmIdle}`,
    rpmMax: `Tours/min (Max): ${data.rpmMax}`,
    noiseIdle: `Bruit (Idle) dB: ${data.noiseIdle}`,
    noiseMax: `Bruit (Max) dB: ${data.noiseMax}`,
    airflowIdle: `Débit (Idle) CFM: ${data.airflowIdle}`,
    airflowMax: `Débit (Max) CFM: ${data.airflowMax}`,
    pwm: `PWM: ${data.pwm ? "Oui" : "Non"}`,
});

const displaySoundCard = (data: SoundCard) => ({
    channels: `Canaux: ${data.channels}`,
    digitalAudio: `Audio numérique: ${data.digitalAudio}`,
    snr: `Rapport signal/bruit: ${data.snr}`,
    sampleRate: `Fréquence d'échantillonnage: ${data.sampleRate}`,
    chipset: `Chipset: ${data.chipset}`,
    interface: `Interface: ${data.interface}`,
});

const displayWirelessNetworkCard = (data: WirelessNetworkCard) => ({
    interface: `Interface: ${data.interface}`,
    protocol: `Protocole: ${data.protocol}`,
});

// Returns structured label/value pairs for table display
export function getComponentSpecs(
    type: ComponentType,
    data: Components
): { label: string; value: string }[] {
    const specMapping: Record<
        ComponentType,
        (data: Components) => { label: string; value: string }[]
    > = {
        CPU: (d) => {
            const cpu = d as Cpu;
            return [
                { label: "Coeurs", value: `${cpu.coreCount}` },
                { label: "Fréquence de base", value: `${cpu.coreClock} GHz` },
                { label: "Fréquence turbo", value: `${cpu.boostClock} GHz` },
                { label: "Architecture", value: `${cpu.microarch}` },
                { label: "TDP", value: `${cpu.tdp} W` },
                {
                    label: "iGPU",
                    value: cpu.graphics || "Aucun",
                },
            ];
        },
        GPU: (d) => {
            const gpu = d as Gpu;
            return [
                { label: "Chipset", value: `${gpu.chipset}` },
                { label: "Mémoire", value: `${gpu.memory} Go` },
                { label: "Fréquence de base", value: `${gpu.coreClock} MHz` },
                { label: "Fréquence turbo", value: `${gpu.boostClock} MHz` },
                { label: "Longueur", value: `${gpu.length} mm` },
            ];
        },
        MOTHERBOARD: (d) => {
            const mb = d as Motherboard;
            return [
                { label: "Socket", value: `${mb.socket}` },
                { label: "Format", value: `${mb.formFactor}` },
                { label: "Mémoire max", value: `${mb.maxMemory} Go` },
                { label: "Slots mémoire", value: `${mb.memorySlots}` },
            ];
        },
        RAM: (d) => {
            const ram = d as Ram;
            return [
                { label: "Type", value: `${ram.type}` },
                { label: "Vitesse", value: `${ram.speed} MHz` },
                { label: "Modules", value: `${ram.modules}x` },
                { label: "Taille", value: `${ram.size} Go` },
                { label: "Latence CAS", value: `CL${ram.casLatency}` },
            ];
        },
        SSD: (d) => {
            const ssd = d as Ssd;
            return [
                { label: "Capacité", value: `${ssd.capacity} Go` },
                { label: "Cache", value: `${ssd.cache} Mo` },
                { label: "Interface", value: `${ssd.interface}` },
                { label: "Format", value: `${ssd.formFactor}` },
            ];
        },
        HDD: (d) => {
            const hdd = d as Hdd;
            return [
                { label: "Capacité", value: `${hdd.capacity} Go` },
                { label: "Cache", value: `${hdd.cache} Mo` },
                { label: "Format", value: `${hdd.formFactor}` },
                { label: "Interface", value: `${hdd.interface}` },
            ];
        },
        POWER_SUPPLY: (d) => {
            const psu = d as Psu;
            return [
                { label: "Type", value: `${psu.type}` },
                { label: "Puissance", value: `${psu.wattage} W` },
                { label: "Efficacité", value: `${psu.efficiency}` },
                { label: "Modulaire", value: `${psu.modular}` },
            ];
        },
        CPU_COOLER: (d) => {
            const cooler = d as CpuCooler;
            return [
                {
                    label: "RPM",
                    value: `${cooler.rpmIdle} - ${cooler.rpmMax}`,
                },
                {
                    label: "Bruit",
                    value: `${cooler.noiseIdle} - ${cooler.noiseMax} dB`,
                },
                { label: "Taille", value: `${cooler.size}` },
            ];
        },
        CASE: (d) => {
            const c = d as Case;
            return [
                { label: "Type", value: `${c.type}` },
                { label: "Panneau latéral", value: `${c.sidePanel}` },
                { label: "Volume", value: `${c.volume}` },
                { label: 'Baies 3.5"', value: `${c.bays3_5}` },
            ];
        },
        CASE_FAN: (d) => {
            const fan = d as CaseFan;
            return [
                { label: "Taille", value: `${fan.size} mm` },
                { label: "RPM", value: `${fan.rpmIdle} - ${fan.rpmMax}` },
                {
                    label: "Bruit",
                    value: `${fan.noiseIdle} - ${fan.noiseMax} dB`,
                },
                {
                    label: "Débit",
                    value: `${fan.airflowIdle} - ${fan.airflowMax} CFM`,
                },
                { label: "PWM", value: fan.pwm ? "Oui" : "Non" },
            ];
        },
        SOUND_CARD: (d) => {
            const sc = d as SoundCard;
            return [
                { label: "Canaux", value: `${sc.channels}` },
                { label: "Audio numérique", value: `${sc.digitalAudio}` },
                { label: "SNR", value: `${sc.snr}` },
                { label: "Échantillonnage", value: `${sc.sampleRate}` },
                { label: "Chipset", value: `${sc.chipset}` },
                { label: "Interface", value: `${sc.interface}` },
            ];
        },
        WIRELESS_NETWORK_CARD: (d) => {
            const wnc = d as WirelessNetworkCard;
            return [
                { label: "Interface", value: `${wnc.interface}` },
                { label: "Protocole", value: `${wnc.protocol}` },
            ];
        },
    };

    return specMapping[type](data).filter(
        (spec) =>
            spec.value !== "null" &&
            spec.value !== "undefined" &&
            spec.value !== ""
    );
}

export function getEnumDisplay(type: ComponentType) {
    return enumDisplayMapping[type];
}

const enumDisplayMapping: Record<ComponentType, string> = {
    CPU: "Processeur",
    GPU: "Carte Graphique",
    MOTHERBOARD: "Carte Mère",
    RAM: "Mémoire Vive",
    SSD: "Disque SSD",
    HDD: "Disque Dur",
    POWER_SUPPLY: "Alimentation",
    CPU_COOLER: "Refroidisseur CPU",
    CASE: "Boîtier",
    CASE_FAN: "Ventilateur de Boîtier",
    SOUND_CARD: "Carte Son",
    WIRELESS_NETWORK_CARD: "Carte Wifi",
};
