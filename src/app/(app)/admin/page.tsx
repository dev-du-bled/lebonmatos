import type { LucideIcon } from "lucide-react";
import { FileText, Star, UserX, Users } from "lucide-react";
import { NavCard } from "@/components/nav/nav-card";

type AdminSection = {
    title: string;
    description: string;
    href: string;
    Icon: LucideIcon;
};

const ADMIN_SECTIONS: AdminSection[] = [
    {
        title: "Utilisateurs",
        description: "Gérer les comptes, bannir ou débannir des membres.",
        href: "/admin/users",
        Icon: Users,
    },
    {
        title: "Signalements — Annonces",
        description: "Consulter les signalements sur les annonces publiées.",
        href: "/admin/reports/posts",
        Icon: FileText,
    },
    {
        title: "Signalements — Avis",
        description: "Consulter les signalements sur les avis laissés.",
        href: "/admin/reports/reviews",
        Icon: Star,
    },
    {
        title: "Signalements — Utilisateurs",
        description: "Consulter les signalements visant des utilisateurs.",
        href: "/admin/reports/accounts",
        Icon: UserX,
    },
];

export default function AdminPage() {
    return (
        <section className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold">Administration</h1>
                <p className="text-sm text-muted-foreground">
                    Tableau de bord de gestion du site.
                </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {ADMIN_SECTIONS.map((section) => (
                    <NavCard key={section.href} {...section} />
                ))}
            </div>
        </section>
    );
}
