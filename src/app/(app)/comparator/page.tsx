import ComparatorContent from "@/components/comparator/comparator-content";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Comparateur",
    description: "Comparez les attributs des composants",
};

export default function ComparatorPage() {
    return (
        <div className="wide-lock">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold">Comparateur</h1>
                <p className="text-sm text-muted-foreground">
                    Comparez des annonces pour dégoter le matos qui correspond
                    le mieux à vos besoins.
                </p>
            </div>
            <ComparatorContent />
        </div>
    );
}
