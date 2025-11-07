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
  | WirelessNetworkCard
  | null;

// loop over the entries of the data object and format them into a string to display on ui
export function formatComponentData(type: ComponentType, data: Components) {
  const entries = Object.keys(data as Record<string, unknown>);

  const displayMapping: Record<ComponentType, Record<string, string | null>> = {
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
    const displayKey = mapping[key] || key;

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
  graphics: `${data.graphics || "Pas de GPU intégré"}`,
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
