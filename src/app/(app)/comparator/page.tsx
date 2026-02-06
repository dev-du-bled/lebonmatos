import { ComparatorContent } from "@/components/comparator/comparator-content";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Comparateur",
    description: "Comparez les attributs des composants",
};

export default function ComparatorPage() {
    return <ComparatorContent />;
}
