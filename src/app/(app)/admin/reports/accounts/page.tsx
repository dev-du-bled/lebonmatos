import { AccountsReportsDataTable } from "./accounts-reports-data-table";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Utilisateurs",
    description: "Gérez les utilisateurs",
};

export default function AccountsReportsPage() {
    return <AccountsReportsDataTable />;
}
