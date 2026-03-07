const AUTH_ERROR_MESSAGES: Record<string, string> = {
    USER_NOT_FOUND: "Utilisateur non trouvé.",
    INVALID_PASSWORD: "Mot de passe invalide.",
    INVALID_EMAIL: "Adresse email invalide.",
    INVALID_EMAIL_OR_PASSWORD: "Email ou mot de passe incorrect.",
    INVALID_USER: "Utilisateur invalide.",
    USER_EMAIL_NOT_FOUND: "L'email de l'utilisateur n'a pas été trouvé.",
    EMAIL_NOT_VERIFIED: "Votre email n'a pas été vérifié.",
    USER_ALREADY_EXISTS: "Un compte avec cet email existe déjà.",
    USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL:
        "Email déja utilisé. Veuillez utiliser une autre adresse email.",
    ACCOUNT_NOT_FOUND: "Le compte n'a pas été trouvé.",
    TOO_MANY_REQUESTS: "Trop de tentatives. Veuillez réessayer plus tard.",
    INVALID_USERNAME_OR_PASSWORD: "Identifiant ou mot de passe incorrect.",
    USERNAME_IS_ALREADY_TAKEN: "Ce nom d'utilisateur est déjà pris.",
};

export function getAuthError(
    code: string | undefined | null,
    fallback: string = "Une erreur est survenue. Veuillez réessayer."
): string {
    if (!code) return fallback;
    return AUTH_ERROR_MESSAGES[code] ?? fallback;
}
