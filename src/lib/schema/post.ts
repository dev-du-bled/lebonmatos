import { z } from "zod";
import type { ReturnedComponent } from "@/utils/components";

/**
 * Schéma pour le modèle Post (correspondant à Prisma)
 */
export const postBaseSchema = z.object({
    id: z.string(),
    userId: z.string(),
    title: z.string().min(3).max(50),
    description: z.string().nullable().optional(),
    price: z.number().int().min(0),
    location: z.string().nullable().optional(),
    componentId: z.string(),
    createdAt: z.date().or(z.string()).optional(),
});

/**
 * Schéma pour la création d'un post (serveur/API)
 */
export const postCreateSchema = z.object({
    componentId: z.string().min(1, {
        message: "Vous devez sélectionner un composant",
    }),
    title: z.string().min(3).max(50, {
        message: "Le titre doit contenir entre 3 et 50 caractères",
    }),
    description: z
        .string()
        .min(20, {
            message: "La description doit contenir au moins 20 caractères",
        })
        .max(1500, {
            message: "La description doit contenir au plus 1500 caractères",
        }),
    price: z.number().int().min(1, {
        message: "Le prix doit être supérieur ou égal à 1€",
    }),
    location: z
        .string()
        .optional()
        .refine((val) => !val || /.+ \d{5}/.test(val), {
            message: "La localisation doit être au format 'Ville 12345'",
        }),
    images: z
        .array(z.string())
        .max(6, { message: "Vous pouvez télécharger jusqu'à 6 images" })
        .optional(),
});

/**
 * Schéma pour le formulaire client de création de post (utilise File au lieu de base64)
 */
export const postFormSchema = z.object({
    component: z.custom<ReturnedComponent>((value) => value !== undefined, {
        error: "Vous devez sélectionner un composant",
    }),
    title: z
        .string()
        .min(3, { error: "Le titre doit contenir au moins 3 caractères" })
        .max(50, {
            error: "Le titre doit contenir au plus 50 caractères",
        }),
    description: z
        .string()
        .min(20, {
            error: "La description doit contenir au moins 20 caractères",
        })
        .max(1500, {
            error: "La description doit contenir au plus 1500 caractères",
        }),
    price: z.number().min(1, {
        message: "Le prix doit être supérieur ou égal à 1€",
    }),

    location: z
        .string()
        .optional()
        .refine((val) => !val || /.+ \d{5}/.test(val), {
            message: "La localisation doit être au format 'Ville 12345'",
        }),
    images: z
        .array(z.union([z.instanceof(File), z.string()]))
        .max(6, { message: "Le nombre d'images est limité à 6" })
        .refine(
            (files) => {
                return files.every(
                    (file) =>
                        typeof file === "string" ||
                        file.type.startsWith("image/")
                );
            },
            { error: "Tous les fichiers doivent être des images" }
        )
        .optional(),
});

// Types
export type Post = z.infer<typeof postBaseSchema>;
export type PostCreateInput = z.infer<typeof postCreateSchema>;
export type PostFormData = Omit<z.infer<typeof postFormSchema>, "component"> & {
    component: ReturnedComponent;
};
