import { type ComponentType } from "@prisma/client";
import SearchPageClient from "./search-page-client";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Annonces",
    description: "Recherchez des annonces de matos à travers le site",
};

type SearchParams = Promise<{
    query?: string;
    componentId?: string;
    componentName?: string;
    componentType?: string;
}>;

export default async function SearchPage({
    searchParams,
}: {
    searchParams: SearchParams;
}) {
    const { query, componentId, componentName, componentType } =
        await searchParams;

    return (
        <SearchPageClient
            initialQuery={query ?? ""}
            initialComponentId={componentId}
            initialComponentName={componentName}
            initialComponentType={componentType as ComponentType | undefined}
        />
    );
}
