import { Client } from "pg";
import { MeiliSearch } from "meilisearch";
import {
    wrappMeiliTask,
    POST_QUERY_BASE,
    TYPE_TO_TABLE,
    COMPONENT_QUERIES_BASE,
} from "./utils";
import { buildComponentDetails } from "@/utils/components";

let client: Client;
let meilisearch: MeiliSearch;
let isSyncing = false;

async function syncPost(id: string) {
    if (!client || !meilisearch) return;
    const { rows } = await client.query(POST_QUERY_BASE + " WHERE p.id = $1", [
        id,
    ]);

    if (rows.length > 0) {
        const post = rows[0];

        // Extract first image if available
        const firstImage =
            post.images && post.images.length > 0 ? post.images[0] : null;

        // If post has no component, return as-is with first image
        if (!post.componentId || !post.componentType) {
            const task = await wrappMeiliTask(
                meilisearch
                    .index("posts")
                    .addDocuments([{ ...post, firstImage }])
            );
            console.log(`Synced post with id '${id}' at ${task.finishedAt}`);
            return;
        }

        // Get the table name for this component type
        const tableName = TYPE_TO_TABLE[post.componentType];
        if (!tableName || !COMPONENT_QUERIES_BASE[tableName]) {
            console.warn(
                `No query found for component type: ${post.componentType}`
            );
            const task = await wrappMeiliTask(
                meilisearch
                    .index("posts")
                    .addDocuments([{ ...post, firstImage }])
            );
            console.log(`Synced post with id '${id}' at ${task.finishedAt}`);
            return;
        }

        // Fetch the specific component data
        const componentQuery = `${COMPONENT_QUERIES_BASE[tableName]} WHERE c.id = $1`;
        const { rows: componentData } = await client.query(componentQuery, [
            post.componentId,
        ]);

        // Build nested component structure
        if (componentData.length > 0) {
            const enrichedPost = {
                ...post,
                firstImage,
                component: {
                    ...buildComponentDetails(componentData[0]),
                },
            };

            const task = await wrappMeiliTask(
                meilisearch.index("posts").addDocuments([enrichedPost])
            );
            console.log(`Synced post with id '${id}' at ${task.finishedAt}`);
        } else {
            await meilisearch.index("posts").deleteDocument(id);
            console.log(`Pruned old post ${id}`);
        }
    } else {
        await meilisearch.index("posts").deleteDocument(id);
        console.log(`Pruned old post ${id}`);
    }
}

async function syncComponent(id: string, table: string) {
    if (!client || !meilisearch) return;
    const queryBase = COMPONENT_QUERIES_BASE[table];
    if (!queryBase) {
        console.error(`No query defined for component table '${table}'`);
        return;
    }

    const { rows } = await client.query(queryBase + " WHERE c.id = $1", [id]);

    if (rows.length > 0) {
        const task = await wrappMeiliTask(
            meilisearch.index(table).addDocuments(rows)
        );
        console.log(
            `Synced component with id '${id}' to index '${table}' at ${task.finishedAt}`
        );
    } else {
        await meilisearch.index(table).deleteDocument(id);
        console.log(`Pruned component ${id} from index ${table}`);
    }
}

async function syncLinkedPosts(id: string) {
    if (!client) return;
    // Update all posts that use this component
    const { rows } = await client.query(
        'SELECT id FROM post WHERE "componentId" = $1',
        [id]
    );
    for (const row of rows) {
        await syncPost(row.id);
    }
}

export async function startSync() {
    if (isSyncing) {
        console.log("Sync process already running.");
        return;
    }

    // Check environment runtime if needed (Next.js server vs build)
    if (process.env.NEXT_RUNTIME === "edge") return;

    const pg_url = process.env["DATABASE_URL"];
    if (!pg_url) {
        console.error(
            "FATAL: No database url was provided, unable to start sync process"
        );
        return;
    }

    const meilisearch_host = process.env["MEILI_HOST"];
    const meilisearch_api_key = process.env["MEILI_MASTER_KEY"];
    if (!meilisearch_host) {
        console.error(
            "FATAL: No Meilisearch host was provided, unable to start sync process"
        );
        return;
    }

    client = new Client(pg_url);
    meilisearch = new MeiliSearch({
        host: meilisearch_host,
        apiKey: meilisearch_api_key,
    });

    client.on("notification", async (msg) => {
        if (!msg.payload) return;

        try {
            const payload = JSON.parse(msg.payload);
            const { id, table, operation, data } = payload;

            console.log(
                `Received '${operation}' on '${table}' with id '${id}'`
            );

            if (table === "post") {
                if (operation === "DELETE") {
                    await wrappMeiliTask(
                        meilisearch.index("posts").deleteDocument(id)
                    );
                    console.log(`Deleted post ${id} from index`);
                } else {
                    await syncPost(id);
                }
            } else if (table === "component") {
                const type = data.type as string;
                const targetTable = TYPE_TO_TABLE[type];

                if (!targetTable) {
                    console.warn(
                        `Unknown component type '${type}' for id '${id}'`
                    );
                    return;
                }

                if (operation === "DELETE") {
                    await wrappMeiliTask(
                        meilisearch.index(targetTable).deleteDocument(id)
                    );
                    console.log(
                        `Deleted component ${id} from index ${targetTable}`
                    );
                } else {
                    await syncComponent(id, targetTable);
                    await syncLinkedPosts(id);
                }
            } else if (COMPONENT_QUERIES_BASE[table]) {
                if (operation === "DELETE") {
                    const componentId = data.componentId;
                    if (componentId) {
                        await syncComponent(componentId, table);
                    }
                } else {
                    // INSERT or UPDATE
                    const componentId = data.componentId;
                    await syncComponent(componentId, table);
                }
            }
        } catch (e) {
            console.error("Error processing notification:", e);
        }
    });

    try {
        await client.connect();
        await client.query("LISTEN db_update");
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
