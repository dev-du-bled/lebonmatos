import type { REPORT_TYPE, REPORT_CONTENT, REPORT_STATUS } from "@prisma/client";

export const reasonLabel: Record<REPORT_TYPE, string> = {
    SPAM: "Spam",
    INNAPPROPRIATE: "Inapproprié",
    HARASSMENT: "Harcèlement",
    SCAM: "Arnaque",
    OTHER: "Autre",
};

export const reasonVariant: Record<
    REPORT_TYPE,
    "destructive" | "secondary" | "outline"
> = {
    SPAM: "secondary",
    INNAPPROPRIATE: "destructive",
    HARASSMENT: "destructive",
    SCAM: "destructive",
    OTHER: "outline",
};

export const typeLabel: Record<REPORT_CONTENT, string> = {
    POST: "Annonce",
    USER: "Utilisateur",
    REVIEW: "Avis",
};

export const statusLabel: Record<REPORT_STATUS, string> = {
    PENDING: "En attente",
    RESOLVED: "Traité",
    REJECTED: "Rejeté",
};

export const statusVariant: Record<
    REPORT_STATUS,
    "default" | "secondary" | "destructive" | "outline"
> = {
    PENDING: "secondary",
    RESOLVED: "default",
    REJECTED: "outline",
};
