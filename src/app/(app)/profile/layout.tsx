import RequiredLogin from "@/components/required-login";

export default function ProfileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <RequiredLogin>{children}</RequiredLogin>;
}
