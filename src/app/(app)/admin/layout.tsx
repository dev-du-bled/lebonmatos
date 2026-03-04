import RequiredLogin from "@/components/auth/required-login";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: {
        default: "Admin",
        template: "Admin - %s | LeBonMatos",
    },
    description: "Panneau d'administration",
};

export default async function AdminRootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <RequiredLogin requireAdmin>{children}</RequiredLogin>;
}
