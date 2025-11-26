import { z } from "zod";
import {
  USERNAME_REGEX,
  PHONE_REGEX,
  nullableString,
  base64ImageSchema,
} from "./shared";
import { profileImageSchema } from "./images";

/**
 * Schémas Zod pour le modèle User et les formulaires de profil
 */

/**
 * Schéma de base pour le modèle User (correspondant à Prisma)
 */
export const userBaseSchema = z.object({
  id: z.string(),
  name: z.string().min(2).max(80),
  email: z.string().email(),
  emailVerified: z.boolean().default(false),
  image: z.string().nullable().optional(),
  phoneNumber: z.string().nullable().optional(),
  username: z
    .string()
    .min(5)
    .max(32)
    .regex(USERNAME_REGEX)
    .nullable()
    .optional(),
  displayUsername: z.string().max(50).nullable().optional(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});

/**
 * Schéma pour le formulaire de profil (formulaire d'édition)
 */
export const profileFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Le nom doit contenir au moins 2 caractères" })
    .max(80, { message: "Le nom ne doit pas dépasser 80 caractères" }),
  username: z
    .string()
    .trim()
    .min(5, {
      message: "Le nom d'utilisateur doit contenir au moins 5 caractères",
    })
    .max(32, {
      message: "Le nom d'utilisateur ne doit pas dépasser 32 caractères",
    })
    .regex(USERNAME_REGEX, {
      message:
        "Le nom d'utilisateur ne peut contenir que des lettres, chiffres, underscores ou points",
    }),
  phoneNumber: z
    .string()
    .trim()
    .max(30, {
      message: "Le numéro de téléphone ne doit pas dépasser 30 caractères",
    })
    .optional()
    .or(z.literal(""))
    .refine((value) => {
      if (!value) return true;
      return PHONE_REGEX.test(value);
    }, "Numéro de téléphone invalide"),
});

/**
 * Schéma pour la mise à jour du profil (avec avatar)
 */
export const profileUpdateSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, { message: "Le nom doit contenir au moins 2 caractères" })
      .max(80, { message: "Le nom ne doit pas dépasser 80 caractères" }),
    username: z
      .string()
      .trim()
      .min(5, {
        message: "Le nom d'utilisateur doit contenir au moins 5 caractères",
      })
      .max(32, {
        message: "Le nom d'utilisateur ne doit pas dépasser 32 caractères",
      })
      .regex(USERNAME_REGEX, {
        message:
          "Le nom d'utilisateur ne peut contenir que des lettres, chiffres, underscores ou points",
      }),
    phoneNumber: nullableString(
      30,
      "Le numéro de téléphone ne doit pas dépasser 30 caractères"
    ).refine((value) => {
      if (!value) return true;
      return PHONE_REGEX.test(value);
    }, "Numéro de téléphone invalide"),
    avatar: z
      .object({
        data: base64ImageSchema,
        alt: nullableString(
          120,
          "Le texte alternatif ne doit pas dépasser 120 caractères"
        ).optional(),
      })
      .optional(),
    removeAvatar: z.boolean().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.avatar && value.removeAvatar) {
      ctx.addIssue({
        path: ["avatar"],
        code: "custom",
        message: "Veuillez choisir entre mettre à jour ou supprimer l'avatar",
      });
    }
  });

/**
 * Schéma pour le profil utilisateur complet (avec relations)
 */
export const userProfileSchema = userBaseSchema.extend({
  profileImage: profileImageSchema.nullable().optional(),
  rating: z.object({
    average: z.number().nullable(),
    count: z.number(),
  }),
});

// Types
export type User = z.infer<typeof userBaseSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;
export type ProfileFormValues = z.infer<typeof profileFormSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

/**
 * Normalise les valeurs du formulaire de profil pour la mise à jour
 */
export function normalizeProfileInput(
  values: ProfileFormValues,
  options?: {
    avatar?: { data: string; alt?: string | null } | null;
    removeAvatar?: boolean;
  }
): ProfileUpdateInput {
  const phoneNumber = values.phoneNumber?.trim() ?? "";

  return profileUpdateSchema.parse({
    name: values.name.trim(),
    username: values.username.trim(),
    phoneNumber,
    avatar: options?.avatar ?? undefined,
    removeAvatar: options?.removeAvatar ?? false,
  });
}
