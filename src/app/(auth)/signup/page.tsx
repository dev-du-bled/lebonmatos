import { SignupForm } from "@/components/auth/signup-form";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Inscription",
};

export default function SignupPage() {
    return <SignupForm />;
}
