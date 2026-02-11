import { Client } from "pg";
import { MeiliSearch } from "meilisearch";
import {
    wrappMeiliTask,
    POST_QUERY_BASE,
    COMPONENT_QUERIES_BASE,
    TYPE_TO_TABLE,
} from "./utils";

const pg_url = process.env["DATABASE_URL"];
if (!pg_url)
    throw Error(
        "FATAL: No database url was provided, unable to start sync process"
    );

const meilisearch_host = process.env["MEILI_HOST"];
const meilisearch_api_key = process.env["MEILI_MASTER_KEY"];
if (!meilisearch_host)
    throw Error(
        "FATAL: No Meilisearch host was provided, unable to start sync process"
    );

const client = new Client(pg_url);
const meilisearch = new MeiliSearch({
    host: meilisearch_host,
    apiKey: meilisearch_api_key,
});

async function syncAll() {
    console.log("Syncing meili and postgres");
    await client.connect();

    try {
        console.log("Fetching all posts...");
        const { rows: posts } = await client.query(POST_QUERY_BASE);

        if (posts.length > 0) {
            console.log(
                `Enriching ${posts.length} posts with component data...`
            );

            // Flatten the post and the relevant component data
            const enrichedPosts = await Promise.all(
                posts.map(async (post) => {
                    const tableName = TYPE_TO_TABLE[post.componentType];
                    if (!tableName || !COMPONENT_QUERIES_BASE[tableName])
                        return;

                    // Fetch the specific component data
                    const componentQuery = `${COMPONENT_QUERIES_BASE[tableName]} WHERE c.id = $1`;
                    const { rows: componentData } = await client.query(
                        componentQuery,
                        [post.componentId]
                    );

                    // Merge post data with component data
                    // Disabling eslint since id isn't explicetly used, but having it there removes it from componentData,
                    // so it doesn't overide the post's id
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { id, estimatedPrice, color, ...componentFields } =
                        componentData[0];
                    return {
                        ...post,
                        componentEstimatedPrice: estimatedPrice,
                        componentColor: color,
                        ...componentFields,
                    };
                })
            );

            console.log(
                `Pushing ${enrichedPosts.length} enriched posts to Meilisearch...`
            );
            const task = await wrappMeiliTask(
                meilisearch.index("posts").addDocuments(enrichedPosts)
            );
            console.log(`Synced posts at ${task.finishedAt}`);
        } else {
            console.log("No posts to sync.");
        }

        for (const [table, query] of Object.entries(COMPONENT_QUERIES_BASE)) {
            console.log(`Fetching all ${table} components...`);
            const { rows: components } = await client.query(query);

            if (components.length > 0) {
                console.log(
                    `Syncing ${components.length} ${table} to Meilisearch...`
                );
                const task = await wrappMeiliTask(
                    meilisearch.index(table).addDocuments(components)
                );
                console.log(`Synced ${table} at ${task.finishedAt}`);
            } else {
                console.log(`No ${table} components to sync.`);
            }
        }

        console.log("Bulk sync completed successfully.");
    } catch (error) {
        console.error("Error during bulk sync:", error);
    } finally {
        await client.end();
    }
}

syncAll();
