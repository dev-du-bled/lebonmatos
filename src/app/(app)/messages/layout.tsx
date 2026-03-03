import RequiredLogin from "@/components/auth/required-login";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Mes messages" };

export default async function MessagesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <RequiredLogin>{children}</RequiredLogin>;
}
