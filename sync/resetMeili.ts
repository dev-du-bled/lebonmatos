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

try {
    // don't care if the indexes don't exists and can't be deleted, no need to yell at me
    await wrappMeiliTask(meilisearch.deleteIndex("posts")).catch(() => {});
    await wrappMeiliTask(meilisearch.deleteIndex("components")).catch(() => {});

    await wrappMeiliTask(
        meilisearch.createIndex("posts", {
            primaryKey: "id",
        })
    );

    await wrappMeiliTask(
        meilisearch.createIndex("components", {
            primaryKey: "id",
        })
    );
} catch (err) {
    console.error((err as MeiliSearchErrorResponse).message);
}
