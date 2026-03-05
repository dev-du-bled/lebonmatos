import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Mot de passe oublie",
};

export const dynamic = "force-dynamic";

export default function ForgotPasswordPage() {
    return <ForgotPasswordForm />;
}
