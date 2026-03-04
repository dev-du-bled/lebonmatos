import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";
import { buttonVariants } from "../ui/button";

interface NavBackProps {
    children?: ReactNode;
    href: string;
    title: string;
    desc: string;
}

export default function NavBack({ children, href, title, desc }: NavBackProps) {
    return (
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
                <Link
                    href={href}
                    className={cn(
                        buttonVariants({
                            variant: "ghost",
                            size: "icon",
                        })
                    )}
                >
                    <ArrowLeft className="size-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-semibold">{title}</h1>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
            </div>
            {children}
        </div>
    );
}
