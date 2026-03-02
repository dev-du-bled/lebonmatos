import { PostsReportsDataTable } from "./posts-reports-data-table";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Annonces",
    description: "Gérez les annonces",
};

export default function PostsReportsPage() {
    return <PostsReportsDataTable />;
}
