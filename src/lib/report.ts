import type { REPORT_TYPE } from "@prisma/client";

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
