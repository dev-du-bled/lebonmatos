"use client";

import { Plus } from "lucide-react";

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
        <article
            onClick={disabled ? undefined : onAdd}
            className={`
                rounded-lg border-2 border-dashed border-border h-[70vh] flex flex-col
                items-center justify-center gap-3 p-8 text-center
                transition-colors duration-200
                ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-muted-foreground/50 hover:bg-muted/30"}
            `}
        >
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                <Plus size={20} className="text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
        </article>
    );
}
