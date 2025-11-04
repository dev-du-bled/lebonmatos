"use client";

import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

interface ReCaptchaProviderProps {
  children: React.ReactNode;
}

export function ReCaptchaProvider({ children }: ReCaptchaProviderProps) {
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
