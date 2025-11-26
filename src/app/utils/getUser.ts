"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

/**
 * @param redirectToLogin - Redirige vers la page de login si non authentifié, comportement par défaut
 * @description Utilitaire pour récupérer l'utilisateur authentifié
 * Redirige vers la page de login si non authentifié
 * @returns L'utilisateur authentifié ou null si non authentifié et redirectToLogin est false
 */

export async function getUser(): Promise<typeof auth.$Infer.Session.user>;

export async function getUser(
    redirectToLogin: true
): Promise<typeof auth.$Infer.Session.user>;

export async function getUser(
    redirectToLogin: false
): Promise<typeof auth.$Infer.Session.user | null>;

export async function getUser(redirectToLogin: boolean = true) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user && redirectToLogin) {
        return redirect("/login");
    }

    return session?.user || null;
}
