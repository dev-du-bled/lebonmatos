import { z } from "zod";

const usernameRegex = /^[a-zA-Z0-9_.]+$/;
const phoneRegex = /^\+?[0-9\s().-]{7,20}$/;

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
    .regex(usernameRegex, {
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
      return phoneRegex.test(value);
    }, "Numéro de téléphone invalide"),
});

const base64ImageSchema = z.string().refine(
  (val) => {
    if (!val.startsWith("data:image/")) return false;
    const base64 = val.split(",")[1];
    return !!base64 && z.base64().safeParse(base64).success;
  },
  { message: "Image invalide" }
);

const nullableString = (max: number, message: string) =>
  z.preprocess((value) => {
    if (typeof value === "string") {
      const trimmed = value.trim();
      return trimmed.length === 0 ? null : trimmed;
    }
    if (value === undefined || value === null) {
      return null;
    }
    return value;
  }, z.string().max(max, { message }).nullable());

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
      .regex(usernameRegex, {
        message:
          "Le nom d'utilisateur ne peut contenir que des lettres, chiffres, underscores ou points",
      }),
    phoneNumber: nullableString(
      30,
      "Le numéro de téléphone ne doit pas dépasser 30 caractères"
    ).refine((value) => {
      if (!value) return true;
      return phoneRegex.test(value);
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

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

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
