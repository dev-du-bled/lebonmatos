"use client";

import { Combobox as ComboboxPrimitive } from "@base-ui/react";
import { REPORT_TYPE, REPORT_STATUS } from "@prisma/client";
import { reasonLabel, statusLabel } from "@/lib/report";
import { ChevronDownIcon, XIcon } from "lucide-react";
import {
    ComboboxContent,
    ComboboxEmpty,
    ComboboxGroup,
    ComboboxItem,
    ComboboxLabel,
    ComboboxList,
    ComboboxSeparator,
} from "@/components/ui/combobox";
import { cn } from "@/lib/utils";
import { useRef } from "react";

export type ReportFilterValue = string[];

interface ReportFiltersProps {
    value: ReportFilterValue;
    onChange: (value: ReportFilterValue) => void;
}

const REASON_ITEMS = Object.values(REPORT_TYPE).map((r) => `reason:${r}`);
const STATUS_ITEMS = Object.values(REPORT_STATUS).map((s) => `status:${s}`);
const ALL_ITEMS = [...REASON_ITEMS, ...STATUS_ITEMS];

function labelForId(id: string): string {
    const [group, val] = id.split(":");
    if (group === "reason") return reasonLabel[val as REPORT_TYPE] ?? val;
    if (group === "status") return statusLabel[val as REPORT_STATUS] ?? val;
    return id;
}

export function ReportFilters({ value, onChange }: ReportFiltersProps) {
    const triggerRef = useRef<HTMLButtonElement>(null);

    function handleValueChange(next: string[]) {
        const prevReasons = value.filter((v) => v.startsWith("reason:"));
        const nextReasons = next.filter((v) => v.startsWith("reason:"));
        const prevStatuses = value.filter((v) => v.startsWith("status:"));
        const nextStatuses = next.filter((v) => v.startsWith("status:"));

        const reason =
            nextReasons.length > 1
                ? nextReasons.filter((r) => !prevReasons.includes(r))
                : nextReasons;

        const status =
            nextStatuses.length > 1
                ? nextStatuses.filter((s) => !prevStatuses.includes(s))
                : nextStatuses;

        onChange([...reason, ...status]);
    }

    function removeItem(id: string, e: React.MouseEvent) {
        e.stopPropagation();
        onChange(value.filter((v) => v !== id));
    }

    return (
        <ComboboxPrimitive.Root
            items={ALL_ITEMS}
            multiple
            value={value}
            onValueChange={handleValueChange}
        >
            <ComboboxPrimitive.Trigger
                ref={triggerRef}
                className={cn(
                    "border-input focus-visible:border-ring focus-visible:ring-ring/50 flex h-8 min-w-32 cursor-pointer items-center gap-1.5 rounded-md border bg-transparent text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px]",
                    value.length > 0 ? "px-1.5" : "px-2.5"
                )}
            >
                {value.length === 0 ? (
                    <span className="text-muted-foreground flex-1 text-left">
                        Filtrer...
                    </span>
                ) : (
                    <div className="flex flex-1 flex-wrap gap-1">
                        {value.map((id) => (
                            <span
                                key={id}
                                className="bg-muted text-foreground flex h-5.5 items-center gap-0.5 rounded-sm pl-1.5 pr-0.5 text-xs font-medium whitespace-nowrap"
                            >
                                {labelForId(id)}
                                <span
                                    role="button"
                                    aria-label={`Supprimer ${labelForId(id)}`}
                                    onClick={(e) => removeItem(id, e)}
                                    className="text-muted-foreground hover:text-foreground flex size-3.5 items-center justify-center rounded-sm"
                                >
                                    <XIcon className="size-3" />
                                </span>
                            </span>
                        ))}
                    </div>
                )}
                <ChevronDownIcon className="text-muted-foreground ml-auto size-4 shrink-0 opacity-50" />
            </ComboboxPrimitive.Trigger>
            <ComboboxContent anchor={triggerRef} align="start" className="w-48">
                <ComboboxEmpty>Aucun résultat.</ComboboxEmpty>
                <ComboboxList>
                    <ComboboxGroup>
                        <ComboboxLabel>Raison</ComboboxLabel>
                        {REASON_ITEMS.map((id) => (
                            <ComboboxItem key={id} value={id}>
                                {labelForId(id)}
                            </ComboboxItem>
                        ))}
                    </ComboboxGroup>
                    <ComboboxSeparator />
                    <ComboboxGroup>
                        <ComboboxLabel>Statut</ComboboxLabel>
                        {STATUS_ITEMS.map((id) => (
                            <ComboboxItem key={id} value={id}>
                                {labelForId(id)}
                            </ComboboxItem>
                        ))}
                    </ComboboxGroup>
                </ComboboxList>
            </ComboboxContent>
        </ComboboxPrimitive.Root>
    );
}
