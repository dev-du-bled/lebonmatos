"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
    onAdd: () => void;
    disabled?: boolean;
    label?: string;
}

export default function ComparatorAddCard({
    onAdd,
    disabled = false,
    label = "Ajouter une annonce",
}: Props) {
    return (
        <article className="border rounded-lg bg-background shadow-sm overflow-hidden">
            <div className="relative h-48">
                <div className="h-full flex items-center justify-center bg-muted text-muted-foreground">
                    <Button
                        variant="outline"
                        onClick={onAdd}
                        disabled={disabled}
                        className="h-14 w-14 rounded-full flex items-center justify-center"
                    >
                        <Plus size={28} />
                    </Button>
                </div>

                <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/60 to-transparent p-4">
                    <h2 className="text-white font-bold text-xl">{label}</h2>
                </div>
            </div>
        </article>
    );
}
