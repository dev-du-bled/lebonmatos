import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { TRPCProvider } from "@/trpc/client";
import Script from "next/script";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: {
        default: "LeBonMatos",
        template: "%s | LeBonMatos",
    },
    description:
        "La plateforme experte en seconde main de matériel informatique",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                {process.env.NODE_ENV === "development" && (
                    <Script
                        crossOrigin="anonymous"
                        src="//unpkg.com/react-scan/dist/auto.global.js"
                    />
                )}

                <Script
                    async
                    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7271888754365820"
                    crossOrigin="anonymous"
                    data-adbreak-test="on"
                />
            </head>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-svh`}
            >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <TRPCProvider>{children}</TRPCProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
