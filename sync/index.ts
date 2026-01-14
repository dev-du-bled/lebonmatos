import { Client } from "pg";
import { MeiliSearch } from "meilisearch";
import { wrappMeiliTask } from "./utils";

const pg_url = process.env["DATABASE_URL"];

if (!pg_url)
    throw Error(
        "FATAL: No database url was provided, unable to start sync process"
    );
const client = new Client(pg_url);

const meilisearch_host = process.env["MEILI_HOST"];
const meilisearch_api_key = process.env["MEILI_MASTER_KEY"];

if (!meilisearch_host)
    throw Error(
        "FATAL: No Meilisearch host was provided, unable to start sync process"
    );
const meilisearch = new MeiliSearch({
    host: meilisearch_host,
    apiKey: meilisearch_api_key,
});

async function syncPost(id: string) {
    const { rows } = await client.query(
        `
        SELECT
            p.id,
            p.title,
            p.description,
            p.price,
            p."userId",
            p."componentId",
            c.name as "componentName",
            c.type as "componentType",
            u.name as "userName",
            (SELECT image FROM images WHERE "postId" = p.id LIMIT 1) as image
        FROM post p
        LEFT JOIN component c ON p."componentId" = c.id
        LEFT JOIN "user" u ON p."userId" = u.id
        WHERE p.id = $1
    `,
        [id]
    );

    if (rows.length > 0) {
        const task = await wrappMeiliTask(
            meilisearch.index("posts").addDocuments(rows)
        );
        console.log(`Synced post with id '${id}' at ${task.finishedAt}`);
    } else {
        // If for some reason it does not exists in Postgres, remove it from meilisearch
        await meilisearch.index("posts").deleteDocument(id);
        console.log(`Pruned old post ${id}`);
    }
}

async function syncComponent(id: string) {
    const { rows } = await client.query(
        `
        SELECT
            c.id,
            c.name,
            c."estimatedPrice",
            c.color,
            c.type,
            cpu."coreCount", cpu."coreClock"::float as "cpuCoreClock", cpu."boostClock"::float as "cpuBoostClock", cpu.microarch, cpu.tdp, cpu.graphics as "cpuGraphics",
            gpu.chipset, gpu.memory as "gpuMemory", gpu."coreClock" as "gpuCoreClock", gpu."boostClock" as "gpuBoostClock", gpu.length as "gpuLength",
            mb.socket, mb."formFactor" as "mbFormFactor", mb."maxMemory", mb."memorySlots",
            ram.type as "ramType", ram.speed, ram.modules, ram.size, ram."casLatency",
            ssd.capacity as "ssdCapacity", ssd.cache as "ssdCache", ssd.interface as "ssdInterface", ssd."formFactor" as "ssdFormFactor",
            hdd.capacity as "hddCapacity", hdd.cache as "hddCache", hdd."formFactor" as "hddFormFactor", hdd.interface as "hddInterface",
            psu.type as "psuType", psu.wattage, psu.efficiency, psu.modular,
            cooler."rpmIdle" as "coolerRpmIdle", cooler."rpmMax" as "coolerRpmMax", cooler."noiseIdle"::float as "coolerNoiseIdle", cooler."noiseMax"::float as "coolerNoiseMax", cooler.size as "coolerSize",
            pc_case.type as "caseType", pc_case."sidePanel", pc_case.volume::float as "caseVolume", pc_case."bays3_5",
            fan.size as "fanSize", fan."rpmIdle" as "fanRpmIdle", fan."rpmMax" as "fanRpmMax", fan."noiseIdle"::float as "fanNoiseIdle", fan."noiseMax"::float as "fanNoiseMax", fan."airflowIdle"::float as "fanAirflowIdle", fan."airflowMax"::float as "fanAirflowMax", fan.pwm,
            sound.channels, sound."digitalAudio", sound.snr, sound."sampleRate", sound.chipset as "soundChipset", sound.interface as "soundInterface",
            wifi.interface as "wifiInterface", wifi.protocol
        FROM component c
        LEFT JOIN cpu ON c.id = cpu."componentId"
        LEFT JOIN gpu ON c.id = gpu."componentId"
        LEFT JOIN motherboard mb ON c.id = mb."componentId"
        LEFT JOIN ram ON c.id = ram."componentId"
        LEFT JOIN ssd ON c.id = ssd."componentId"
        LEFT JOIN hdd ON c.id = hdd."componentId"
        LEFT JOIN "powerSupply" psu ON c.id = psu."componentId"
        LEFT JOIN "cpuCooler" cooler ON c.id = cooler."componentId"
        LEFT JOIN "case" pc_case ON c.id = pc_case."componentId"
        LEFT JOIN "caseFan" fan ON c.id = fan."componentId"
        LEFT JOIN "soundCard" sound ON c.id = sound."componentId"
        LEFT JOIN "wirelessNetworkCard" wifi ON c.id = wifi."componentId"
        WHERE c.id = $1
    `,
        [id]
    );

    if (rows.length > 0) {
        const task = await wrappMeiliTask(
            meilisearch.index("components").addDocuments(rows)
        );
        console.log(`Synced component with id '${id}' at ${task.finishedAt}`);
    } else {
        await meilisearch.index("components").deleteDocument(id);
        console.log(`Pruned old component ${id}`);
    }
}

async function syncLinkedPosts(id: string) {
    // Update all posts that use this component
    const { rows } = await client.query(
        'SELECT id FROM post WHERE "componentId" = $1',
        [id]
    );
    for (const row of rows) {
        await syncPost(row.id);
    }
}

client.on("notification", async (msg) => {
    if (!msg.payload) return;

    try {
        const { id, table, operation } = JSON.parse(msg.payload);
        console.log(`Received '${operation}' on '${table}' with id '${id}'`);

        if (table === "post") {
            if (operation === "DELETE") {
                await wrappMeiliTask(
                    meilisearch.index("posts").deleteDocument(id)
                );
                console.log(`Deleted post ${id} from index`);
            } else {
                await syncPost(id);
            }
            // would probably be better to use a case statement here, to avoid slowing down
            // the sync each time we add a new table
        } else if (table === "component") {
            if (operation === "DELETE") {
                await wrappMeiliTask(
                    meilisearch.index("components").deleteDocument(id)
                );
                console.log(`Deleted component ${id} from index`);
            } else {
                await syncComponent(id);
                await syncLinkedPosts(id);
            }
        }
    } catch (e) {
        console.error("Error processing notification:", e);
    }
});

(async () => {
    await client.connect();
    await client.query("LISTEN db_update");
    console.log("Listening for database updates...");
})();
