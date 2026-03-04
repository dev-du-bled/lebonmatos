import { Client } from "pg";
import { EventEmitter } from "events";
import { pool } from "./prisma";

const PG_CHANNEL = "app_events";

const globalForPubSub = global as unknown as {
    pgEmitter: EventEmitter;
    pgListenerReady: Promise<void> | null;
};

export const messageEmitter: EventEmitter =
    globalForPubSub.pgEmitter ?? new EventEmitter();
messageEmitter.setMaxListeners(0);

function startListener(): Promise<void> {
    if (globalForPubSub.pgListenerReady) return globalForPubSub.pgListenerReady;

    const ready = (async () => {
        const client = new Client({
            connectionString: process.env.DATABASE_URL,
        });

        client.on("notification", (msg) => {
            if (msg.channel === PG_CHANNEL && msg.payload) {
                try {
                    const { ch, d } = JSON.parse(msg.payload);
                    if (d !== undefined) {
                        messageEmitter.emit(ch, d);
                    } else {
                        messageEmitter.emit(ch);
                    }
                } catch {
                    // ignore malformed payloads
                }
            }
        });

        client.on("error", () => {
            globalForPubSub.pgListenerReady = null;
            setTimeout(() => void startListener(), 3000);
        });

        await client.connect();
        await client.query(`LISTEN ${PG_CHANNEL}`);
    })();

    globalForPubSub.pgListenerReady = ready;
    return ready;
}

export async function publish(channel: string, data?: unknown): Promise<void> {
    await startListener();
    const payload = JSON.stringify({ ch: channel, d: data });
    await pool.query("SELECT pg_notify($1, $2)", [PG_CHANNEL, payload]);
}

// Ne pas démarrer le listener pendant le build Next.js
if (process.env.NEXT_PHASE !== "phase-production-build") {
    void startListener();
}

if (process.env.NODE_ENV !== "production") {
    globalForPubSub.pgEmitter = messageEmitter;
}
