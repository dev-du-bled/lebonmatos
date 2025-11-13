import Header from "@/components/nav/header";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <main className="bg-muted min-h-svh">
      <Header initialSession={session} />
      {children}
    </main>
  );
}
