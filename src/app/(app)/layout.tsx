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
    <div>
      <Header initialSession={session} />
      {children}
    </div>
  );
}
