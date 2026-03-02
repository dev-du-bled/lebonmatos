import { Metadata } from "next";
import { UsersDataTable } from "./users-data-table";

export const metadata: Metadata = {
    title: "Utilisateurs",
    description: "Gérez les comptes utilisateurs",
};

export default function AccountsPage() {
    return <UsersDataTable />;
}
