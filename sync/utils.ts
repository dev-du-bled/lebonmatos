import { EnqueuedTaskPromise, Task } from "meilisearch";

export const wrappMeiliTask = async (
    task: EnqueuedTaskPromise
): Promise<Task> => {
    // timeout after 20 minutes to give some time to meilisearch to return us the results of the tasks
    // useful when we spawn dozen thousands tasks roughfly at once
    const taskresult = await task.waitTask({ timeout: 1200000 });
    if (taskresult.error) throw taskresult.error;

    return taskresult;
};

export const POST_QUERY_BASE = `
    SELECT
        p.id,
        p.title,
        p.description,
        p.price,
        p."userId",
        p."componentId",
        p.images,
        c.name as "componentName",
        c.type as "componentType",
        u.name as "userName"
    FROM post p
    LEFT JOIN component c ON p."componentId" = c.id
    LEFT JOIN "user" u ON p."userId" = u.id
`;

export const TYPE_TO_TABLE: Record<string, string> = {
    CPU: "cpu",
    GPU: "gpu",
    MOTHERBOARD: "motherboard",
    RAM: "ram",
    SSD: "ssd",
    HDD: "hdd",
    POWER_SUPPLY: "powerSupply",
    CPU_COOLER: "cpuCooler",
    CASE: "case",
    CASE_FAN: "caseFan",
    SOUND_CARD: "soundCard",
    WIRELESS_NETWORK_CARD: "wirelessNetworkCard",
};

export const COMPONENT_QUERIES_BASE: Record<string, string> = {
    cpu: `
        SELECT c.id, c.name, c."estimatedPrice", c.color, c.type,
               t."coreCount", t."coreClock"::float, t."boostClock"::float, t.microarch, t.tdp, t.graphics
        FROM component c
        JOIN cpu t ON c.id = t."componentId"`,
    gpu: `
        SELECT c.id, c.name, c."estimatedPrice", c.color, c.type,
               t.chipset, t.memory, t."coreClock", t."boostClock", t.length
        FROM component c
        JOIN gpu t ON c.id = t."componentId"`,
    motherboard: `
        SELECT c.id, c.name, c."estimatedPrice", c.color, c.type,
               t.socket, t."formFactor", t."maxMemory", t."memorySlots"
        FROM component c
        JOIN motherboard t ON c.id = t."componentId"`,
    ram: `
        SELECT c.id, c.name, c."estimatedPrice", c.color, c.type,
               t.type as "ramType", t.speed, t.modules, t.size, t."casLatency"
        FROM component c
        JOIN ram t ON c.id = t."componentId"`,
    ssd: `
        SELECT c.id, c.name, c."estimatedPrice", c.color, c.type,
               t.capacity, t.cache, t.interface, t."formFactor"
        FROM component c
        JOIN ssd t ON c.id = t."componentId"`,
    hdd: `
        SELECT c.id, c.name, c."estimatedPrice", c.color, c.type,
               t.capacity, t.cache, t."formFactor", t.interface
        FROM component c
        JOIN hdd t ON c.id = t."componentId"`,
    powerSupply: `
        SELECT c.id, c.name, c."estimatedPrice", c.color, c.type,
               t.type as "psuType", t.wattage, t.efficiency, t.modular
        FROM component c
        JOIN "power_supply" t ON c.id = t."componentId"`,
    cpuCooler: `
        SELECT c.id, c.name, c."estimatedPrice", c.color, c.type,
               t."rpmIdle", t."rpmMax", t."noiseIdle"::float, t."noiseMax"::float, t.size
        FROM component c
        JOIN "cpu_cooler" t ON c.id = t."componentId"`,
    case: `
        SELECT c.id, c.name, c."estimatedPrice", c.color, c.type,
               t.type as "caseType", t."sidePanel", t.volume::float, t."bays3_5"
        FROM component c
        JOIN "case" t ON c.id = t."componentId"`,
    caseFan: `
        SELECT c.id, c.name, c."estimatedPrice", c.color, c.type,
               t.size, t."rpmIdle", t."rpmMax", t."noiseIdle"::float, t."noiseMax"::float, t."airflowIdle"::float, t."airflowMax"::float, t.pwm
        FROM component c
        JOIN "case_fan" t ON c.id = t."componentId"`,
    soundCard: `
        SELECT c.id, c.name, c."estimatedPrice", c.color, c.type,
               t.channels, t."digitalAudio", t.snr, t."sampleRate", t.chipset, t.interface
        FROM component c
        JOIN "sound_card" t ON c.id = t."componentId"`,
    wirelessNetworkCard: `
        SELECT c.id, c.name, c."estimatedPrice", c.color, c.type,
               t.interface, t.protocol
        FROM component c
        JOIN "wireless_network_card" t ON c.id = t."componentId"`,
};
