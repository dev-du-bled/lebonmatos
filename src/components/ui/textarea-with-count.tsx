import { Textarea } from "./textarea";
import { ChangeEvent, ComponentProps, useState } from "react";

interface TextareaWithCountProps extends ComponentProps<"textarea"> {
    maxLength: number;
    warnAt?: number;
    error?: string;
}

function TextareaWithCount({
    maxLength,
    error,
    className,
    value,
    onChange,
    ...props
}: TextareaWithCountProps) {
    const [internalValue, setInternalValue] = useState((value as string) ?? "");

    const controlled = value !== undefined;
    const current = controlled ? String(value ?? "") : internalValue;

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        if (!controlled) setInternalValue(e.target.value);
        onChange?.(e);
    };

    return (
        <div className="space-y-1">
            <Textarea
                maxLength={maxLength}
                className={className}
                value={controlled ? value : internalValue}
                onChange={handleChange}
                {...props}
            />
            <div className="flex items-center justify-between gap-2">
                {error ? (
                    <p className="text-xs text-destructive">{error}</p>
                ) : (
                    <span />
                )}
                <p className="text-xs text-muted-foreground tabular-nums transition-colors shrink-0">
                    {current.length}/{maxLength}
                </p>
            </div>
        </div>
    );
}

export { TextareaWithCount };
