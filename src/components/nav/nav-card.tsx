import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardTitle,
} from "@/components/ui/card";

type NavCardProps = {
    title: string;
    description: string;
    href: string;
    Icon: LucideIcon;
};

export function NavCard({ title, description, href, Icon }: NavCardProps) {
    return (
        <Link href={href} className="group" prefetch={false}>
            <Card className="h-full gap-3 border-transparent bg-secondary/40 p-5 transition hover:border-primary hover:bg-background hover:shadow-md">
                <CardContent className="flex h-full flex-col gap-4 p-0">
                    <div className="flex items-center gap-3">
                        <span className="flex size-11 items-center justify-center rounded-lg bg-primary/20 transition group-hover:bg-primary group-hover:text-black">
                            <Icon className="size-5" />
                        </span>
                        <CardTitle className="text-base font-semibold">
                            {title}
                        </CardTitle>
                    </div>
                    <CardDescription className="text-sm text-muted-foreground">
                        {description}
                    </CardDescription>
                </CardContent>
            </Card>
        </Link>
    );
}
