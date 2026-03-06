import { meilisearch } from "@/lib/meilisearch";
import z from "zod";
import { createTRPCRouter, privateProcedure, publicProcedure } from "../init";
import { ComponentType } from "@prisma/client";
import { ReturnedComponent } from "@/utils/components";

export const componentRouter = createTRPCRouter({
    getComponents: privateProcedure
        .input(
            z.object({
                query: z.string().min(3),
                type: z.enum(ComponentType),
            })
        )
        .query(async ({ input }): Promise<ReturnedComponent[]> => {
            const index = meilisearch.index(input.type);
            const results = await index.search(input.query, { limit: 20 });

            return results.hits.map((hit) => {
                const { id, name, estimatedPrice, color, type,
                    Cpu, Gpu, Motherboard, Ram, Ssd, Hdd, Psu,
                    CpuCooler, Case, CaseFan, SoundCard, WirelessNetworkCard,
                } = hit;
                const data = Cpu ?? Gpu ?? Motherboard ?? Ram ?? Ssd ?? Hdd
                    ?? Psu ?? CpuCooler ?? Case ?? CaseFan ?? SoundCard
                    ?? WirelessNetworkCard ?? {};
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
            const results = await index.search(input.query, {
                limit: input.limit,
            });
            return results.hits as {
                id: string;
                name: string;
                type: ComponentType;
            }[];
        }),
});
