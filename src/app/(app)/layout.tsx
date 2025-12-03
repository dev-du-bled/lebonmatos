import Header from "@/components/nav/header";
import Footer from "@/components/nav/footer";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import "../globals.css";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    return (
        <main className="min-h-svh">
            <Header className={"wide-lock"} initialSession={session} />
            {children}
            <Footer/>
        </main>
    );
}
