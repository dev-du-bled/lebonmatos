import { LoginForm } from "@/components/auth/login-form";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Connexion",
};

export const dynamic = "force-dynamic";

export default function LoginPage() {
    return <LoginForm />;
}
