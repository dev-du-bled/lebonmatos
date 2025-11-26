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

  if (!image || (image.isPrivate && user && image.ownerId !== user.id)) {
    return NextResponse.redirect(new URL("/placeholder.webp", req.url));
  }

  const buffer = Buffer.from(image.image.split(",")[1], "base64");

  return new Response(buffer, {
    headers: {
      "Content-Type": "image/webp",
    },
  });
}
