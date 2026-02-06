import { CityData, searchAddress } from "@/utils/location";
import { Dispatch, SetStateAction, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { ScrollArea } from "../ui/scroll-area";
import { XIcon, Loader2 } from "lucide-react";
import {
    InputGroup,
    InputGroupInput,
    InputGroupAddon,
} from "../ui/input-group";
import { Button } from "../ui/button";

interface LocationSelectorProps {
    defaultValue?: CityData;
    onChange: Dispatch<SetStateAction<CityData | undefined>>;
    disabled?: boolean;
}

export default function LocationSelector({
    defaultValue,
    onChange,
    disabled,
    ...props
}: LocationSelectorProps) {
    const [addressSuggestions, setAddressSuggestions] = useState<CityData[]>(
        []
    );
    const [inputValue, setInputValue] = useState(
        defaultValue ? defaultValue.name : ""
    );
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const searchLocation = async (search: string) => {
        if (search.length < 3) {
            setAddressSuggestions([]);
            setIsLoading(false);
            setHasSearched(false);
            return;
        }
        setIsLoading(true);
        const results = await searchAddress(search, 5);
        setAddressSuggestions(results);
        setIsLoading(false);
        setHasSearched(true);
    };

    const debouncedSearch = useDebouncedCallback(searchLocation, 350);

    return (
        <Popover
            open={
                inputValue.length >= 3 &&
                (addressSuggestions.length > 0 || isLoading || hasSearched)
            }
            onOpenChange={(open) => {
                if (!open) {
                    setAddressSuggestions([]);
                    setHasSearched(false);
                }
            }}
        >
            <PopoverTrigger asChild>
                <InputGroup>
                    <InputGroupInput
                        placeholder="Rechercher une localisation"
                        disabled={disabled}
                        value={inputValue}
                        onChange={(e) => {
                            setInputValue(e.target.value);
                            debouncedSearch(e.target.value);
                        }}
                        {...props}
                    />
                    <InputGroupAddon align="inline-end">
                        <button
                            className="opacity-50 hover:opacity-100 transition-opacity"
                            type="button"
                            hidden={inputValue.length === 0}
                            onClick={() => {
                                setInputValue("");
                                onChange(undefined);
                                setHasSearched(false);
                            }}
                        >
                            <XIcon className="size-4" />
                        </button>
                    </InputGroupAddon>
                </InputGroup>
            </PopoverTrigger>
            <PopoverContent
                className="w-(--radix-popover-trigger-width) p-0 py-2 pl-1"
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <ScrollArea className="pr-3">
                    <div className="space-y-2 max-h-40">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-4">
                                <Loader2 className="size-4 animate-spin opacity-50" />
                            </div>
                        ) : addressSuggestions.length === 0 ? (
                            <div className="flex items-center justify-center py-4 px-3 text-sm text-muted-foreground">
                                Aucun résultat trouvé
                            </div>
                        ) : (
                            addressSuggestions.map((s, i) => (
                                <Button
                                    key={i}
                                    variant="ghost"
                                    className="flex justify-start w-full h-auto px-3 py-1.5"
                                    onClick={() => {
                                        onChange(s);
                                        setInputValue(s.name);
                                        setAddressSuggestions([]);
                                        setHasSearched(false);
                                    }}
                                >
                                    <div className="text-start flex flex-col">
                                        {s.name}
                                        <span className="text-xs text-muted-foreground">
                                            {s.state} -{" "}
                                            {s.countryCode.toUpperCase()}
                                        </span>
                                    </div>
                                </Button>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
