import RequiredLogin from "@/components/auth/required-login";

export default async function AdminRootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <RequiredLogin requireAdmin>
            {children}
        </RequiredLogin>
    );
}
