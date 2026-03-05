import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Reinitialiser le mot de passe",
};

export const dynamic = "force-dynamic";

export default function ResetPasswordPage() {
    return <ResetPasswordForm />;
}
