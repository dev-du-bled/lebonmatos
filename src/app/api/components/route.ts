import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

declare global {
    var prisma: PrismaClient | undefined;
}

const prisma =
    globalThis.prisma ||
    new PrismaClient({
        log:
            process.env.NODE_ENV === "development"
                ? ["query", "info", "warn", "error"]
                : ["error"],
    });

if (process.env.NODE_ENV !== "production") {
    globalThis.prisma = prisma;
}

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const q = url.searchParams.get("q")?.trim() || null;
        const typeFilter = url.searchParams.get("type") || null;

        const where: Record<string, unknown> = {};

        if (typeFilter && typeFilter !== "ALL") {
            where.type = typeFilter;
        }

        if (q) {
            where.OR = [
                { name: { contains: q, mode: "insensitive" } },
                { color: { contains: q, mode: "insensitive" } },
            ];
        }

        // Requête simple sans les détails
        const components = await prisma.component.findMany({
            where: Object.keys(where).length ? where : undefined,
            orderBy: { name: "asc" },
        });

        const payload = components.map((c: any) => ({
            id: c.id,
            name: c.name,
            estimatedPrice: c.estimatedPrice,
            color: c.color,
            type: c.type,
        }));

        return NextResponse.json(payload, { status: 200 });
    } catch (error) {
        console.error("Error fetching components:", error);
        return NextResponse.json(
            { message: "Unable to load components" },
            { status: 500 }
        );
    }
}
