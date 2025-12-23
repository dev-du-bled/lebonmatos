import { z } from "zod";
import {
    USERNAME_REGEX,
    PHONE_REGEX,
    nullableString,
    base64ImageSchema,
} from "./shared";
import { profileImageSchema } from "./images";

// Schéma de base User (Prisma)
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
    bio: z.string().max(500).nullable().optional(),
    createdAt: z.date().or(z.string()),
    updatedAt: z.date().or(z.string()),
});

// Champs réutilisables
const nameField = z
    .string()
    .trim()
    .min(2, { message: "Le nom doit contenir au moins 2 caractères" })
    .max(80, { message: "Le nom ne doit pas dépasser 80 caractères" });

const usernameField = z
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
    });

const bioFormField = z
    .string()
    .trim()
    .max(500, { message: "La bio ne doit pas dépasser 500 caractères" })
    .optional()
    .or(z.literal(""));

const phoneNumberFormField = z
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
    }, "Numéro de téléphone invalide");

// Formulaires (Client)
export const publicProfileFormSchema = z.object({
    username: usernameField,
    bio: bioFormField,
});

export const personalInfoFormSchema = z.object({
    name: nameField,
    phoneNumber: phoneNumberFormField,
});

export const profileFormSchema = z.object({
    name: nameField,
    username: usernameField,
    bio: bioFormField,
    phoneNumber: phoneNumberFormField,
});

// Mise à jour (Serveur) - transforme "" en null
const emptyToNull = (val: string | undefined) =>
    !val || val.trim() === "" ? null : val.trim();

export const publicProfileUpdateSchema = z
    .object({
        username: usernameField,
        bio: bioFormField.transform(emptyToNull),
        avatar: z
            .object({
                data: base64ImageSchema,
                alt: z
                    .string()
                    .max(120)
                    .optional()
                    .transform((v) => v?.trim() || null),
            })
            .optional(),
        removeAvatar: z.boolean().optional(),
    })
    .superRefine((value, ctx) => {
        if (value.avatar && value.removeAvatar) {
            ctx.addIssue({
                path: ["avatar"],
                code: "custom",
                message:
                    "Veuillez choisir entre mettre à jour ou supprimer l'avatar",
            });
        }
    });

export const personalInfoUpdateSchema = z.object({
    name: nameField,
    phoneNumber: phoneNumberFormField.transform(emptyToNull),
});

export const profileUpdateSchema = z
    .object({
        name: nameField,
        username: usernameField,
        bio: bioFormField.transform(emptyToNull),
        phoneNumber: phoneNumberFormField.transform(emptyToNull),
        avatar: z
            .object({
                data: base64ImageSchema,
                alt: z
                    .string()
                    .max(120)
                    .optional()
                    .transform((v) => v?.trim() || null),
            })
            .optional(),
        removeAvatar: z.boolean().optional(),
    })
    .superRefine((value, ctx) => {
        if (value.avatar && value.removeAvatar) {
            ctx.addIssue({
                path: ["avatar"],
                code: "custom",
                message:
                    "Veuillez choisir entre mettre à jour ou supprimer l'avatar",
            });
        }
    });

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
export type PublicProfileFormValues = z.infer<typeof publicProfileFormSchema>;
export type PersonalInfoFormValues = z.infer<typeof personalInfoFormSchema>;
export type ProfileUpdateInput = z.input<typeof profileUpdateSchema>;
export type PublicProfileUpdateInput = z.input<
    typeof publicProfileUpdateSchema
>;
export type PersonalInfoUpdateInput = z.input<typeof personalInfoUpdateSchema>;
export type ProfileUpdateOutput = z.output<typeof profileUpdateSchema>;
export type PublicProfileUpdateOutput = z.output<
    typeof publicProfileUpdateSchema
>;
export type PersonalInfoUpdateOutput = z.output<
    typeof personalInfoUpdateSchema
>;

// Normalisation
export function normalizePublicProfileInput(
    values: PublicProfileFormValues,
    options?: {
        avatar?: { data: string; alt?: string | null } | null;
        removeAvatar?: boolean;
    }
): PublicProfileUpdateInput {
    return {
        ...values,
        avatar: options?.avatar
            ? {
                  data: options.avatar.data,
                  alt: options.avatar.alt || undefined,
              }
            : undefined,
        removeAvatar: options?.removeAvatar ?? false,
    };
}

export function normalizeProfileInput(
    values: ProfileFormValues,
    options?: {
        avatar?: { data: string; alt?: string | null } | null;
        removeAvatar?: boolean;
    }
): ProfileUpdateInput {
    return {
        ...values,
        avatar: options?.avatar
            ? {
                  data: options.avatar.data,
                  alt: options.avatar.alt || undefined,
              }
            : undefined,
        removeAvatar: options?.removeAvatar ?? false,
    };
}
