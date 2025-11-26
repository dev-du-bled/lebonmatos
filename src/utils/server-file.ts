"use server";

import sharp from "sharp";

/**
 * convert a base64 image to webp and return the base64 string
 * @param base64 string to convert
 * @returns the converted base64 string in webp
 */
export async function ConvertToWebp(base64: string): Promise<string> {
  const buffer = Buffer.from(base64.split(",")[1], "base64");
  const data = await sharp(buffer).webp().toBuffer();
  return `data:image/webp;base64,${data.toString("base64")}`;
}
