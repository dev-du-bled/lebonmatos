import { Client } from "pg";
import { MeiliSearch } from "meilisearch";
import { ComponentType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
    wrappMeiliTask,
    POST_INCLUDE,
    COMPONENT_INCLUDE,
    toMeiliPost,
    decimalToNumber,
} from "./utils";

let pgClient: Client;
let meilisearch: MeiliSearch;
let isSyncing = false;

const PG_TABLE_TO_TYPE: Record<string, ComponentType> = {
    Cpu: "CPU",
    Gpu: "GPU",
    Motherboard: "MOTHERBOARD",
    Ram: "RAM",
    Ssd: "SSD",
    Hdd: "HDD",
    Psu: "POWER_SUPPLY",
    CpuCooler: "CPU_COOLER",
    Case: "CASE",
    CaseFan: "CASE_FAN",
    SoundCard: "SOUND_CARD",
    WirelessNetworkCard: "WIRELESS_NETWORK_CARD",
};

async function syncPost(id: string) {
    const post = await prisma.post.findUnique({
        where: { id },
        include: POST_INCLUDE,
    });

    if (post) {
        const doc = decimalToNumber(toMeiliPost(post));
        const task = await wrappMeiliTask(
            meilisearch.index("posts").addDocuments([doc])
        );
        console.log(`Synced post '${id}' at ${task.finishedAt}`);
    } else {
        await meilisearch.index("posts").deleteDocument(id);
        console.log(`Pruned post ${id}`);
    }
}

async function syncComponent(componentId: string) {
    const component = await prisma.component.findUnique({
        where: { id: componentId },
        include: COMPONENT_INCLUDE,
    });

    if (component) {
        const indexName = component.type;
        const doc = decimalToNumber(component);
        const task = await wrappMeiliTask(
            meilisearch.index(indexName).addDocuments([doc])
        );
        console.log(`Synced component '${componentId}' to index '${indexName}' at ${task.finishedAt}`);
    }
}

async function syncLinkedPosts(componentId: string) {
    const posts = await prisma.post.findMany({
        where: { componentId },
        select: { id: true },
    });
    for (const { id } of posts) {
        await syncPost(id);
    }
}

async function syncSubComponentByRow(componentId: string) {
    await syncComponent(componentId);
    await syncLinkedPosts(componentId);
}

export async function startSync() {
    if (isSyncing) {
        console.log("Sync process already running.");
        return;
    }

    if (process.env.NEXT_RUNTIME === "edge") return;

    const pg_url = process.env["DATABASE_URL"];
    if (!pg_url) {
        console.error("FATAL: No database url was provided, unable to start sync process");
        return;
    }

    const meilisearch_host = process.env["MEILI_HOST"];
    const meilisearch_api_key = process.env["MEILI_MASTER_KEY"];
    if (!meilisearch_host) {
        console.error("FATAL: No Meilisearch host was provided, unable to start sync process");
        return;
    }

    pgClient = new Client(pg_url);
    meilisearch = new MeiliSearch({
        host: meilisearch_host,
        apiKey: meilisearch_api_key,
    });

    pgClient.on("notification", async (msg) => {
        if (!msg.payload) return;

        try {
            const payload = JSON.parse(msg.payload);
            const { id, table, operation, data } = payload;

            console.log(`Received '${operation}' on '${table}' with id '${id}'`);

            if (table === "Post") {
                if (operation === "DELETE") {
                    await wrappMeiliTask(
                        meilisearch.index("posts").deleteDocument(id)
                    );
                    console.log(`Deleted post ${id} from index`);
                } else {
                    await syncPost(id);
                }
            } else if (table === "Location") {
                const postId = data.postId as string;
                if (postId) await syncPost(postId);
            } else if (table === "Component") {
                if (operation === "DELETE") {
                    const type = data.type as ComponentType;
                    await wrappMeiliTask(
                        meilisearch.index(type).deleteDocument(id)
                    );
                    console.log(`Deleted component ${id} from index ${type}`);
                } else {
                    await syncComponent(id);
                    await syncLinkedPosts(id);
                }
            } else if (PG_TABLE_TO_TYPE[table]) {
                const componentId = data.componentId as string;
                if (componentId) {
                    await syncSubComponentByRow(componentId);
                }
            }
        } catch (e) {
            console.error("Error processing notification:", e);
        }
    });

    try {
        await pgClient.connect();
        await pgClient.query("LISTEN db_update");
        console.log("Listening for database updates...");
        isSyncing = true;
    } catch (e) {
        console.error("Error connecting to database:", e);
    }
}

// @ts-expect-error - Bun is not defined in the browser
if (typeof Bun !== "undefined" && import.meta.main) {
    startSync();
}
