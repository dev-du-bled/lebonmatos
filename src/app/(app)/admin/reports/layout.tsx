import AdminTabs from "@/components/admin/admin-tabs";
import NavBack from "@/components/nav/nav-back";

export default async function AdminReportsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="wide-lock pt-2 space-y-6">
            <NavBack
                href="/admin"
                title="Signalements"
                desc="Gérer les signalements"
            />
            <AdminTabs />
            {children}
        </div>
    );
}
