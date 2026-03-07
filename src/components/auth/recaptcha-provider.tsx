"use client";

import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

interface ReCaptchaProviderProps {
    children: React.ReactNode;
}

export function ReCaptchaProvider({ children }: ReCaptchaProviderProps) {
    // On retourne pas le provider du captcha en prod
    if (process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_TESTS_ENV) {
        return <>{children}</>;
    }

    return (
        <GoogleReCaptchaProvider
            reCaptchaKey={process.env.NEXT_PUBLIC_GOOGLE_RECAPTCHA_SITE_KEY!}
            useRecaptchaNet={false}
            useEnterprise={false}
            scriptProps={{
                async: false,
                defer: false,
                appendTo: "head",
                nonce: undefined,
            }}
        >
            {children}
        </GoogleReCaptchaProvider>
    );
}
