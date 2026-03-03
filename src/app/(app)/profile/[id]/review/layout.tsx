import RequiredLogin from "@/components/required-login";

export default function ReviewLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <RequiredLogin>{children}</RequiredLogin>;
}
