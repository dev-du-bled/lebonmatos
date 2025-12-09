import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

declare global {
    var prisma: PrismaClient | undefined;
}

const prisma =
    globalThis.prisma ||
    new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["query", "info", "warn", "error"] : ["error"],
    });

if (process.env.NODE_ENV !== "production") {
    globalThis.prisma = prisma;
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        const component = await prisma.component.findUnique({
            where: { id },
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
        });

        if (!component) {
            return NextResponse.json({ message: "Component not found" }, { status: 404 });
        }

        // Flatten
        const {
            Cpu,
            Gpu,
            Motherboard,
            Ram,
            Ssd,
            Hdd,
            Psu,
            CpuCooler,
            Case: CaseData,
            CaseFan,
            SoundCard,
            WirelessNetworkCard,
            ...base
        } = component as any;

        const details =
            Cpu ||
            Gpu ||
            Motherboard ||
            Ram ||
            Ssd ||
            Hdd ||
            Psu ||
            CpuCooler ||
            CaseData ||
            CaseFan ||
            SoundCard ||
            WirelessNetworkCard ||
            {};
        const { id: detailId, componentId, type: detailType, ...rest } = details;

        // Convert Decimals
        Object.keys(rest).forEach((key) => {
            if (rest[key]?.toNumber) rest[key] = rest[key].toNumber();
        });

        // Merge base fields with details, but keep the component type
        const payload = { ...base, ...rest };

        return NextResponse.json(payload, { status: 200 });
    } catch (error) {
        console.error("Error fetching component:", error);
        return NextResponse.json({ message: "Unable to load component" }, { status: 500 });
    }
}
