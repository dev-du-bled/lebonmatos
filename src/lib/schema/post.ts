import { z } from "zod";
import type { ReturnedComponent } from "@/utils/components";
import { AddressData } from "@/utils/location";

export const postBaseSchema = z.object({
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
    price: z.number().min(1, {
        message: "Le prix doit être supérieur ou égal à 1€",
    }),
    location: z.custom<AddressData>((value) => value !== undefined, {
        error: "Vous devez sélectionner une localisation valide",
    }),
});

/**
 * Schéma pour la création d'un post (serveur/API)
 */
export const postCreateSchema = postBaseSchema.extend({
    componentId: z.string().min(1, {
        message: "Vous devez sélectionner un composant",
    }),
    images: z
        .array(z.string())
        .max(6, { message: "Vous pouvez télécharger jusqu'à 6 images" })
        .optional(),
});

/**
 * Schéma pour le formulaire client de création de post (utilise File au lieu de base64)
 */
export const postFormSchema = postBaseSchema.extend({
    component: z.custom<ReturnedComponent>((value) => value !== undefined, {
        error: "Vous devez sélectionner un composant",
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
export type PostCreateInput = z.infer<typeof postCreateSchema>;
export type PostFormData = z.infer<typeof postFormSchema>;
