import RequiredLogin from "@/components/auth/required-login";

export default function ReviewLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <RequiredLogin>{children}</RequiredLogin>;
}
