import RequiredLogin from "@/components/auth/required-login";

export default async function ProfileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <RequiredLogin>{children}</RequiredLogin>;
}
