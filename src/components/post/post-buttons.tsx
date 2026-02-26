"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import { useSession } from "../auth/session-provider";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export function BuyButtons() {
    const { session } = useSession();

    const user = session?.user;

    if (!user) return null;

    return (
        <Card className="gap-3">
            <CardHeader>
                <CardTitle>Intéressé ?</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
                <div className="flex gap-2">
                    <Link href="#" className="flex-1">
                        <Button variant={"outline"} className="w-full">
                            Faire une offre
                        </Button>
                    </Link>
                    <Link href="#" className="flex-1">
                        <Button className="w-full">Acheter</Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}

export function ContactButton() {
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
