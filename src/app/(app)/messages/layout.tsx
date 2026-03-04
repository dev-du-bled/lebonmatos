import RequiredLogin from "@/components/required-login";

export const metadata = { title: "Mes messages" };

export default async function MessagesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <RequiredLogin>{children}</RequiredLogin>;
}
