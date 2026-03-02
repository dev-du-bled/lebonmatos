"use client";

import { TabsList, TabsTrigger, Tabs } from "@/components/ui/tabs";
import { usePathname, useRouter } from "next/navigation";

export default function AdminTabs() {
    const router = useRouter();
    const path = usePathname();

    const defaultPath = path.includes("/posts")
        ? "posts"
        : path.includes("/reviews")
        ? "reviews"
        : "accounts";

    return (
        <Tabs
            defaultValue={defaultPath}
            onValueChange={(v) => router.push(`/admin/reports/${v}`)}
        >
            <TabsList variant="line" className="space-x-4">
                <TabsTrigger value="posts">Annonces</TabsTrigger>
                <TabsTrigger value="accounts">Utilisateurs</TabsTrigger>
                <TabsTrigger value="reviews">Avis</TabsTrigger>
            </TabsList>
        </Tabs>
    );
}
