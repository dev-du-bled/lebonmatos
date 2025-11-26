import { z } from "zod";
import { USERNAME_REGEX, FORBIDDEN_USERNAMES } from "./shared";

/**
 * Schémas Zod pour l'authentification (login, signup)
 */

/**
 * Schéma pour le formulaire de connexion
 */
export const loginSchema = z.object({
  email: z.string().email({
    message: "Veuillez entrer une adresse email valide.",
  }),
  password: z.string().min(6, {
    message: "Le mot de passe doit contenir au moins 6 caractères.",
  }),
});

/**
 * Schéma pour le formulaire d'inscription
 */
export const signupSchema = z
  .object({
    name: z.string().min(2, {
      message: "Le nom doit contenir au moins 2 caractères.",
    }),
    username: z
      .string()
      .min(5, {
        message: "Le nom d'utilisateur doit contenir au moins 5 caractères.",
      })
      .max(32, {
        message: "Le nom d'utilisateur ne doit pas dépasser 32 caractères.",
      })
      .regex(USERNAME_REGEX, {
        message:
          "Le nom d'utilisateur ne peut contenir que des lettres, des chiffres et des underscores.",
      })
      .refine((val) => !FORBIDDEN_USERNAMES.includes(val.toLowerCase()), {
        message: "Ce nom d'utilisateur n'est pas autorisé.",
      }),
    email: z.string().email({
      message: "Veuillez entrer une adresse email valide.",
    }),
    password: z.string().min(6, {
      message: "Le mot de passe doit contenir au moins 6 caractères.",
    }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

// Types
export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
