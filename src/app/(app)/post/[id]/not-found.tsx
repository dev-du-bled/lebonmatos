import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
    return (
        // we remove header and footer height to center the content
        <div className="flex flex-col items-center justify-center text-center min-h-[calc(100dvh-220px-76px)]">
            <div className="flex flex-col gap-1 items-center justify-center">
                <p className="text-4xl font-bold">Annonce pas trouvée</p>
                <p className="text-muted-foreground text-sm mb-3">
                    L&apos;annonce que vous cherchez semble ne pas exister.
                </p>
                <Link href="/">
                    <Button size="sm">Retour à l&apos;accueil</Button>
                </Link>
            </div>
        </div>
    );
}
