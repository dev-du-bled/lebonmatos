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
    "cpu",
    "gpu",
    "motherboard",
    "ram",
    "ssd",
    "hdd",
    "powerSupply",
    "cpuCooler",
    "case",
    "caseFan",
    "soundCard",
    "wirelessNetworkCard",
];

try {
    for (const index of indexes) {
        // don't care if the indexes don't exists and can't be deleted, no need to yell at me
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
                    .updateFilterableAttributes(["componentType", "componentId", "locationCity", "_geo", "price", "componentColor"])
            );
        }

        console.log(`Reset index: ${index}`);
    }
} catch (err) {
    console.error((err as MeiliSearchErrorResponse).message);
}
