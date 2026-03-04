import NavBack from "@/components/nav/nav-back";

export default async function AdminUsersLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="wide-lock pt-2 space-y-6">
            <NavBack
                href="/admin"
                title="Utilisateurs"
                desc="Gérer les comptes utilisateurs"
            />
            {children}
        </div>
    );
}
