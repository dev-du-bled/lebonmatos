import { MeiliSearch, MeiliSearchErrorResponse } from "meilisearch";
import { wrappMeiliTask } from "./utils";

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

const indexes = [
    "posts",
    "components",
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

try {
    for (const index of indexes) {
        await wrappMeiliTask(meilisearch.deleteIndex(index)).catch(() => {});

        await wrappMeiliTask(
            meilisearch.createIndex(index, {
                primaryKey: "id",
            })
        );

        if (index === "posts") {
            await wrappMeiliTask(
                meilisearch
                    .index(index)
                    .updateFilterableAttributes([
                        "component.type",
                        "component.color",
                        "componentId",
                        "location.city",
                        "_geo",
                        "price",
                    ])
            );
        }

        console.log(`Reset index: ${index}`);
    }
} catch (err) {
    console.error((err as MeiliSearchErrorResponse).message);
}
