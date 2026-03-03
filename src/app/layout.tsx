import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { ThemeProvider } from "@/components/theme-provider";
import { TRPCProvider } from "@/trpc/client";
import dynamic from "next/dynamic";
import Script from "next/script";
import { extractRouterConfig } from "uploadthing/server";
import { lbmFileRouter } from "./api/uploadthing/core";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Lightbox } from "@/components/ui/lightbox";

const DevToolbox = dynamic(() =>
    import("@/components/dev/toolbox").then((mod) => mod.DevToolbox)
);

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
                <NextSSRPlugin
                    routerConfig={extractRouterConfig(lbmFileRouter)}
                />
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <TRPCProvider>
                        <TooltipProvider>{children}</TooltipProvider>
                        {process.env.NODE_ENV === "development" && <DevToolbox />}
                    </TRPCProvider>
                    <Lightbox />
                    <Toaster />
                </ThemeProvider>
            </body>
        </html>
    );
}
