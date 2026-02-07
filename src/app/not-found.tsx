import { DynamicLogo } from "@/components/dynamic-logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col text-center items-center justify-between">
            <div className="flex-1 flex flex-col gap-2.5 items-center justify-center">
                <p className="text-5xl font-semibold font-mono">404</p>
                <p className="text-5xl font-bold">Pas trouvé</p>
                <p className="text-muted-foreground text-sm">
                    Il ne semble pas y avoir de matos par ici.
                </p>
                <Link href="/">
                    <Button size="sm">Retour à l&apos;accueil</Button>
                </Link>
            </div>

            <div>
                <DynamicLogo width={200} className="mb-12" />
            </div>
        </div>
    );
}
