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
  NetworkCard,
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
  | NetworkCard
  | null;

export function formatEnumType(type: ComponentType) {
  return type.charAt(0) + type.slice(1).replaceAll("_", " ").toLowerCase();
}

// loop over the entries of the data object and format them into a string to display on ui
export function formatComponentData(type: ComponentType, data: Components) {
  const entries = Object.keys(data as Record<string, unknown>);

  const displayMapping: Record<string, Record<string, string>> = {
    CPU: displayCpu,
    GPU: displayGpu,
    MOTHERBOARD: displayMotherboard,
    RAM: displayRam,
    SSD: displaySsd,
    HDD: displayHdd,
    POWER_SUPPLY: displayPsu,
    CPU_COOLER: displayCpuCooler,
    CASE: displayCase,
    CASE_FAN: displayCaseFan,
    SOUND_CARD: displaySoundCard,
    NETWORK_CARD: displayNetworkCard,
  };

  const mapping = displayMapping[type];

  const formattedData = entries.map((key) => {
    if (key === "id" || key === "componentId") return null;
    if ((data as Record<string, unknown>)[key] === null) return null;
    const value = (data as Record<string, unknown>)[key];
    const displayKey = mapping[key] || key;

    return `${displayKey} : ${value}`;
  });

  return formattedData;
}

const displayCpu = {
  coreCount: "Cœurs",
  coreClock: "Fréquence de base",
  boostClock: "Fréquence Boost",
  microarch: "Microarchitecture",
  tdp: "TDP",
  graphics: "Graphiques intégrés",
};

const displayGpu = {
  chipset: "Chipset",
  memory: "Vram",
  coreClock: "Fréquence de base",
  boostClock: "Fréquence Boost",
  length: "Longueur",
};

const displayMotherboard = {
  socket: "Socket",
  formFactor: "Format",
  maxMemory: "Mémoire maximale",
  memorySlots: "Emplacements mémoire",
};

const displayRam = {
  type: "Type",
  speed: "Vitesse",
  modules: "Modules",
  size: "Capacité",
  casLatency: "Latence CAS",
};

const displaySsd = {
  capacity: "Capacité",
  cache: "Cache",
  interface: "Interface",
  formFactor: "Format",
};

const displayHdd = {
  capacity: "Capacité",
  cache: "Cache",
  formFactor: "Format",
  interface: "Interface",
};

const displayPsu = {
  type: "Type",
  wattage: "Puissance",
  efficiency: "Efficacité",
  modular: "Modulaire",
};

const displayCpuCooler = {
  rpmIdle: "Tours/min (Idle)",
  rpmMax: "Tours/min (Max)",
  noiseIdle: "Bruit (Idle) dB",
  noiseMax: "Bruit (Max) dB",
  size: "Taille",
};

const displayCase = {
  type: "Type",
  sidePanel: "Panneau latéral",
  volume: "Volume",
  bays3_5: 'Baies 3.5"',
};

const displayCaseFan = {
  size: "Taille",
  rpmIdle: "Tours/min (Idle)",
  rpmMax: "Tours/min (Max)",
  noiseIdle: "Bruit (Idle) dB",
  noiseMax: "Bruit (Max) dB",
  airflowIdle: "Débit (Idle) CFM",
  airflowMax: "Débit (Max) CFM",
  pwm: "PWM",
};

const displaySoundCard = {
  channels: "Canaux",
  digitalAudio: "Audio numérique",
  snr: "Rapport signal/bruit",
  sampleRate: "Fréquence d'échantillonnage",
  chipset: "Chipset",
  interface: "Interface",
};

const displayNetworkCard = {
  interface: "Interface",
  protocol: "Protocole",
};
