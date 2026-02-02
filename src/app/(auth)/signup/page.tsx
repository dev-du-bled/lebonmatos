import { SignupForm } from "@/components/auth/signup-form";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Inscription",
};

export const dynamic = "force-dynamic";

export default function SignupPage() {
    return <SignupForm />;
}
