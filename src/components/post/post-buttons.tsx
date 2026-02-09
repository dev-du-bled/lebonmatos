"use client";

import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { Button } from "../ui/button";
import { useSession } from "../auth/session-provider";

interface ButtonsProps {
    initialUser?: typeof authClient.$Infer.Session.user | null;
}

export function BuyButtons({ initialUser: _initialUser }: ButtonsProps) {
    const { session } = useSession();

    const user = session?.user;

    return (
        <>
            {user && (
                <div className="flex gap-2 mt-2 md:mt-0">
                    <Link href="#">
                        <Button variant={"outline"}>Faire une offre</Button>
                    </Link>
                    <Link href="#">
                        <Button>Acheter</Button>
                    </Link>
                </div>
            )}
        </>
    );
}

export function ContactButton({ initialUser: _initialUser }: ButtonsProps) {
    const { session } = useSession();

    const user = session?.user;

    if (user) {
        return (
            <Link href={"#"}>
                <Button>Contacter</Button>
            </Link>
        );
    }
}
