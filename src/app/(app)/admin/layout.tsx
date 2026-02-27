import AdminTabs from "@/components/admin/admin-tabs";
import RequiredLogin from "@/components/auth/required-login";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <RequiredLogin requireAdmin>
            <div className="wide-lock pt-2 space-y-6">
                <h3 className="font-bold text-4xl">Signalements</h3>
                <AdminTabs />
                {children}
            </div>
        </RequiredLogin>
    );
}
