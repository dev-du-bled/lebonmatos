"use client";

import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { Button } from "../ui/button";

interface ButtonsProps {
    initialUser?: typeof authClient.$Infer.Session.user | null;
}

export function BuyButtons({ initialUser }: ButtonsProps) {
    const { data, isPending } = authClient.useSession();

    const user = isPending ? initialUser : data?.user;

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

export function ContactButton({ initialUser }: ButtonsProps) {
    const { data, isPending } = authClient.useSession();

    const user = isPending ? initialUser : data?.user;

    if (user) {
        return (
            <Link href={"#"}>
                <Button>Contacter</Button>
            </Link>
        );
    }
}
