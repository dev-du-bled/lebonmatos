import type {
    REPORT_TYPE,
    REPORT_CONTENT,
    REPORT_STATUS,
} from "@prisma/client";

export const reasonLabel: Record<REPORT_TYPE, string> = {
    SPAM: "Spam",
    INNAPPROPRIATE: "Inapproprié",
    HARASSMENT: "Harcèlement",
    SCAM: "Arnaque",
    OTHER: "Autre",
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
    REJECTED: "destructive",
};

/** allow us to save a string in the db if the related content is deleted so we have a feedback on the ui for the user */
export function buildContentSnapshot(
    content:
        | { type: "POST"; title: string }
        | { type: "REVIEW"; comment: string | null; rating: number }
        | { type: "USER"; username: string }
): string {
    switch (content.type) {
        case "POST":
            return content.title;
        case "REVIEW": {
            return `${content.rating}/5${content.comment ? ` — ${content.comment}` : ""}`;
        }
        case "USER":
            return content.username;
    }
}
