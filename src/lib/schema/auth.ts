import { z } from "zod";
import { USERNAME_REGEX, FORBIDDEN_USERNAMES } from "./shared";

/**
 * Schémas Zod pour l'authentification (login, signup)
 */

/**
 * Schéma pour le formulaire de connexion
 */
export const loginSchema = z.object({
    email: z.email({
        error: "Veuillez entrer une adresse email valide.",
    }),
    password: z.string().min(6, {
        error: "Le mot de passe doit contenir au moins 6 caractères.",
    }),
});

/**
 * Schéma pour le formulaire d'inscription
 */
export const signupSchema = z
    .object({
        name: z.string().min(2, {
            error: "Le nom doit contenir au moins 2 caractères.",
        }),
        username: z
            .string()
            .min(5, {
                error:
                    "Le nom d'utilisateur doit contenir au moins 5 caractères.",
            })
            .max(32, {
                error:
                    "Le nom d'utilisateur ne doit pas dépasser 32 caractères.",
            })
            .regex(USERNAME_REGEX, {
                error:
                    "Le nom d'utilisateur ne peut contenir que des lettres, des chiffres et des underscores.",
            })
            .refine((val) => !FORBIDDEN_USERNAMES.includes(val.toLowerCase()), {
                error: "Ce nom d'utilisateur n'est pas autorisé.",
            }),
        email: z.email({
            error: "Veuillez entrer une adresse email valide.",
        }),
        password: z.string().min(6, {
            error: "Le mot de passe doit contenir au moins 6 caractères.",
        }),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        error: "Les mots de passe ne correspondent pas",
        path: ["confirmPassword"],
    });

// Types
export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
