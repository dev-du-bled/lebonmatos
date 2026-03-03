import RequiredLogin from "@/components/required-login";

export default async function ProfileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <RequiredLogin>{children}</RequiredLogin>;
}
