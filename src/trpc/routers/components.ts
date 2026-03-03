import { meilisearch } from "@/lib/meilisearch";
import z from "zod";
import { createTRPCRouter, privateProcedure, publicProcedure } from "../init";
import { ComponentType } from "@prisma/client";
import { ReturnedComponent } from "@/utils/components";

const TYPE_TO_INDEX: Record<ComponentType, string> = {
    CPU: "cpu",
    GPU: "gpu",
    MOTHERBOARD: "motherboard",
    RAM: "ram",
    SSD: "ssd",
    HDD: "hdd",
    POWER_SUPPLY: "powerSupply",
    CPU_COOLER: "cpuCooler",
    CASE: "case",
    CASE_FAN: "caseFan",
    SOUND_CARD: "soundCard",
    WIRELESS_NETWORK_CARD: "wirelessNetworkCard",
};

export const componentRouter = createTRPCRouter({
    getComponents: privateProcedure
        .input(
            z.object({
                query: z.string().min(3),
                type: z.enum(ComponentType),
            })
        )
        .query(async ({ input }): Promise<ReturnedComponent[]> => {
            const index = meilisearch.index(TYPE_TO_INDEX[input.type]);
            const results = await index.search(input.query, { limit: 20 });

            return results.hits.map((hit) => {
                const { id, name, estimatedPrice, color, type, ...data } = hit;
                return {
                    id,
                    name,
                    type,
                    price: estimatedPrice,
                    color,
                    data,
                };
            });
        }),

    searchAll: publicProcedure
        .input(
            z.object({
                query: z.string().min(1),
                limit: z.number().min(1).max(20).default(10),
            })
        )
        .query(async ({ input }) => {
            const index = meilisearch.index("components");
            const results = await index.search(input.query, { limit: input.limit });
            return results.hits as { id: string; name: string; type: ComponentType }[];
        }),
});
