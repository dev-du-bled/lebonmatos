import Header from "@/components/nav/header";
import Footer from "@/components/nav/footer";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { SessionProvider } from "@/components/auth/session-provider";
import "../globals.css";

export default async function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    return (
        <SessionProvider initialSession={session}>
            <main className="flex min-h-svh flex-col">
                <Header initialSession={session} />
                <div className="flex-1">{children}</div>
                <Footer />
            </main>
        </SessionProvider>
    );
}
