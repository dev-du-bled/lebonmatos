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

export async function GET() {
    try {
        // Return a compact representation that matches the ComponentItem used on the client
        const components = await prisma.component.findMany({
            select: {
                id: true,
                name: true,
                estimatedPrice: true,
                color: true,
                type: true,
            },
            orderBy: { name: "asc" },
        });

        // Normalize estimatedPrice to be a number | null (Prisma returns number | null already)
        const payload = components.map((c) => ({
            id: c.id,
            name: c.name,
            estimatedPrice: c.estimatedPrice ?? null,
            color: c.color ?? null,
            type: c.type,
        }));

        return NextResponse.json(payload, { status: 200 });
    } catch (error) {
        console.error("Error fetching components:", error);
        return NextResponse.json({ message: "Unable to load components" }, { status: 500 });
    }
}
