import { prisma } from "@/lib/prisma";
import { getUser } from "@/utils/get-user";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  ctx: RouteContext<"/api/image/[id]">
) {
  const { id } = await ctx.params;
  const user = await getUser(false);

  const image = await prisma.images.findUnique({
    where: { id },
  });

  if (!image) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  if (image.isPrivate && user && image.ownerId !== user.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const buffer = Buffer.from(image.data.split(",")[1], "base64");

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "image/webp",
    },
  });
}
