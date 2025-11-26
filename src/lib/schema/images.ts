import { z } from "zod";

/**
 * Schémas Zod pour le modèle Images
 */

/**
 * Schéma pour le modèle Images (correspondant à Prisma)
 */
export const imagesSchema = z.object({
  id: z.string(),
  image: z.string(),
  alt: z.string().nullable().optional(),
  postId: z.string().nullable().optional(),
});

/**
 * Schéma pour l'image de profil
 */
export const profileImageSchema = imagesSchema.pick({
  id: true,
  image: true,
  alt: true,
});

export type Images = z.infer<typeof imagesSchema>;
export type ProfileImage = z.infer<typeof profileImageSchema>;
