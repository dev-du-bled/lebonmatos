import { prisma } from "@/lib/prisma";
import z from "zod";
import { createTRPCRouter, privateProcedure } from "../init";
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
            const components = await prisma.component.findMany({
                where: {
                    type: input.type,
                    name: {
                        contains: input.query,
                        mode: "insensitive",
                    },
                },
                include: {
                    Cpu: true,
                    Gpu: true,
                    Motherboard: true,
                    Ram: true,
                    Ssd: true,
                    Hdd: true,
                    Psu: true,
                    CpuCooler: true,
                    Case: true,
                    CaseFan: true,
                    SoundCard: true,
                    WirelessNetworkCard: true,
                },
                // take: 10,
            });

            return components.map((component) => {
                let data = null;
                switch (component.type) {
                    case ComponentType.CPU:
                        data = component.Cpu;
                        break;
                    case ComponentType.GPU:
                        data = component.Gpu;
                        break;
                    case ComponentType.RAM:
                        data = component.Ram;
                        break;
                    case ComponentType.MOTHERBOARD:
                        data = component.Motherboard;
                        break;
                    case ComponentType.HDD:
                        data = component.Hdd;
                        break;
                    case ComponentType.SSD:
                        data = component.Ssd;
                        break;
                    case ComponentType.POWER_SUPPLY:
                        data = component.Psu;
                        break;
                    case ComponentType.CASE:
                        data = component.Case;
                        break;
                    case ComponentType.CASE_FAN:
                        data = component.CaseFan;
                        break;
                    case ComponentType.CPU_COOLER:
                        data = component.CpuCooler;
                        break;
                    case ComponentType.SOUND_CARD:
                        data = component.SoundCard;
                        break;
                    case ComponentType.WIRELESS_NETWORK_CARD:
                        data = component.WirelessNetworkCard;
                        break;
                }

                return {
                    id: component.id,
                    name: component.name,
                    type: component.type,
                    price: component.estimatedPrice,
                    color: component.color,
                    data,
                };
            });
        }),
});
