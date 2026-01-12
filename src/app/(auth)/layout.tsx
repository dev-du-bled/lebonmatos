import { DynamicLogo } from "@/components/dynamic-logo";
import { FieldDescription } from "@/components/ui/field";
import { ReCaptchaProvider } from "@/components/auth/recaptcha-provider";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    return (
        <ReCaptchaProvider>
            <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
                <div className="w-full max-w-sm md:max-w-md">
                    <div className="flex flex-col gap-6">
                        <Link href="/">
                            <DynamicLogo
                                width={300}
                                variant="default"
                                className="mx-auto"
                            />
                        </Link>
                        {children}
                        <FieldDescription className="px-6 text-center">
                            En cliquant sur continuer, vous acceptez nos{" "}
                            <a href="#">Conditions d&apos;utilisation</a> et
                            notre <a href="#">Politique de confidentialité</a>.
                        </FieldDescription>
                    </div>
                </div>
            </div>
        </ReCaptchaProvider>
    );
}
