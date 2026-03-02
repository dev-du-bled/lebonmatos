import AdminTabs from "@/components/admin/admin-tabs";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function AdminReportsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="wide-lock pt-2 space-y-6">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin"
                        className={cn(
                            buttonVariants({
                                variant: "ghost",
                                size: "icon",
                            })
                        )}
                    >
                        <ArrowLeft className="size-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-semibold">Signalements</h1>
                        <p className="text-sm text-muted-foreground">
                            Gérer les signalements
                        </p>
                    </div>
                </div>
            </div>
            <AdminTabs />
            {children}
        </div>
    );
}
