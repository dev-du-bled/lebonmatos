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
            // If a component is deleted, posts referring to it might be deleted by cascade or set null.
            // If updated, we re-sync linked posts.
            // I don't think we'll ever (during the project's lifespan) have to delete components,
            // but ig it still is good to handle the case where we would
            if (operation !== "DELETE") {
                await syncComponent(id);
            } else {
                // [TODO] Sync component creation
            } // A case statement would be better here too
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
