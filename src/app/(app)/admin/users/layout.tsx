import RequiredLogin from "@/components/auth/required-login";

export default async function AdminUsersLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <RequiredLogin requireAdmin>
            <div className="wide-lock pt-2 space-y-6">
                <h3 className="font-bold text-4xl">Utilisateurs</h3>
                {children}
            </div>
        </RequiredLogin>
    );
}
