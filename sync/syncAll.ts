import { MeiliSearch } from "meilisearch";
import { ComponentType } from "@prisma/client";
import { prisma } from "./prisma";
import {
    wrappMeiliTask,
    POST_INCLUDE,
    COMPONENT_INCLUDE,
    toMeiliPost,
    decimalToNumber,
} from "./utils";

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

const ALL_TYPES: ComponentType[] = [
    "CPU",
    "GPU",
    "MOTHERBOARD",
    "RAM",
    "SSD",
    "HDD",
    "POWER_SUPPLY",
    "CPU_COOLER",
    "CASE",
    "CASE_FAN",
    "SOUND_CARD",
    "WIRELESS_NETWORK_CARD",
];

async function syncAll() {
    console.log("Syncing meili and postgres");

    try {
        console.log("Fetching all components for 'components' index...");
        const allComponents = await prisma.component.findMany({
            select: { id: true, name: true, type: true },
        });
        if (allComponents.length > 0) {
            const compTask = await wrappMeiliTask(
                meilisearch.index("components").addDocuments(allComponents)
            );
            console.log(
                `Synced ${allComponents.length} components at ${compTask.finishedAt}`
            );
        }

        console.log("Fetching all posts...");
        const posts = await prisma.post.findMany({
            include: POST_INCLUDE,
        });

        if (posts.length > 0) {
            const docs = posts.map((post) =>
                decimalToNumber(toMeiliPost(post))
            );
            console.log(`Pushing ${docs.length} posts to Meilisearch...`);
            const task = await wrappMeiliTask(
                meilisearch.index("posts").addDocuments(docs)
            );
            console.log(`Synced posts at ${task.finishedAt}`);
        } else {
            console.log("No posts to sync.");
        }

        for (const type of ALL_TYPES) {
            console.log(`Fetching all ${type} components...`);
            const components = await prisma.component.findMany({
                where: { type },
                include: COMPONENT_INCLUDE,
            });

            if (components.length > 0) {
                const docs = components.map((c) => decimalToNumber(c));
                const task = await wrappMeiliTask(
                    meilisearch.index(type).addDocuments(docs)
                );
                console.log(
                    `Synced ${components.length} ${type} at ${task.finishedAt}`
                );
            } else {
                console.log(`No ${type} components to sync.`);
            }
        }

        console.log("Bulk sync completed successfully.");
    } catch (error) {
        console.error("Error during bulk sync:", error);
    } finally {
        await prisma.$disconnect();
    }
}

syncAll();
