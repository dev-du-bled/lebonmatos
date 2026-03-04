import { ReviewsReportsDataTable } from "./reviews-reports-data-table";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Avis",
    description: "Gérez les avis",
};

export default function ReviewsReportsPage() {
    return <ReviewsReportsDataTable />;
}
