import { z } from "zod";

/**
 * Constantes et helpers partagés pour les schémas Zod
 */

export const USERNAME_REGEX = /^[a-zA-Z0-9_.]+$/;
export const PHONE_REGEX = /^\+?[0-9\s().-]{7,20}$/;

export const FORBIDDEN_USERNAMES = [
    "admin",
    "root",
    "super",
    "moderator",
    "user",
    "guest",
    "test",
    "demo",
    "example",
];

/**
 * Helper pour créer un champ string nullable
 */
export const nullableString = (max: number, message: string) =>
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
