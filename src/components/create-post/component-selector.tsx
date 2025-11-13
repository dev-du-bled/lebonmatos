"use client";

import { Input } from "../ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";
import { trpc } from "@/trpc/client";
import { useEffect, useState } from "react";
import { LoaderCircle, X } from "lucide-react";
import {
  Components,
  formatComponentData,
  getEnumDisplay,
  ReturnedComponent,
} from "@/utils/components";
import { ComponentType } from "@prisma/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";

interface ComponentSelectorProps {
  selectedComponent?: ReturnedComponent;
  setSelectedComponent: (component?: ReturnedComponent) => void;
  errored: boolean;
}

export default function ComponentSelector({
  selectedComponent,
  setSelectedComponent,
  errored,
}: ComponentSelectorProps) {
  const componentTypes = Object.values(ComponentType);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [type, setType] = useState<ComponentType | undefined>(undefined);

  const clearQuery = () => {
    setDebouncedQuery("");
    setQuery("");
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  const { data, isFetching, error } = trpc.components.getComponents.useQuery(
    {
      query: debouncedQuery,
      type: type as ComponentType,
    },
    {
      enabled: type !== undefined && debouncedQuery.length >= 3,
    }
  );

  return (
    <Card className={errored ? "border-destructive" : ""}>
      <CardContent>
        <CardHeader className="p-0 mb-4">
          <CardTitle>Sélectionner un composant</CardTitle>
          <CardDescription>
            Sélectionner un composant pour créer votre annonce.
          </CardDescription>
        </CardHeader>

        {!selectedComponent && (
          <div className="space-y-2">
            <Select
              onValueChange={(value) => {
                setType(value as ComponentType);
              }}
              value={type}
            >
              {/* TODO: fix responsive of the select trigger on small phones screen */}
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Composant" />
              </SelectTrigger>
              <SelectContent>
                {componentTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {getEnumDisplay(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative">
              <Input
                value={query}
                disabled={type === undefined}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un composant..."
                className="pr-8"
              />
              <button
                type="button"
                onClick={() => clearQuery()}
                disabled={type === undefined || isFetching}
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              >
                {query && query.length > 0 && (
                  <X
                    size={14}
                    className="text-muted-foreground hover:text-accent-foreground transition-colors"
                  />
                )}
              </button>
            </div>
          </div>
        )}

        {selectedComponent ? (
          <div className="relative">
            <div className="mt-4 p-4 border border-secondary rounded-md overflow-auto wrap-break-word">
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 w-6 h-6"
                onClick={() => setSelectedComponent(undefined)}
              >
                <X />
              </Button>
              <span className="text-sm text-muted-foreground">
                {getEnumDisplay(selectedComponent.type)}
              </span>
              <h2 className="font-semibold mb-2">{selectedComponent.name}</h2>
              {formatComponentData(
                selectedComponent.type,
                selectedComponent.data as Components
              ).map((uiString, index) => (
                <div key={index} className="text-sm text-muted-foreground">
                  {uiString}
                </div>
              ))}
            </div>
          </div>
        ) : data && data.length > 0 ? (
          <>
            <ScrollArea className="h-72 mt-2 w-full rounded-md border px-2">
              {data.map((component) => (
                <div
                  key={component.id}
                  className="cursor-pointer hover:bg-accent border border-transparent rounded-md p-2"
                  onClick={() => {
                    setSelectedComponent(component as ReturnedComponent);
                    clearQuery();
                  }}
                >
                  <div className="flex flex-col">
                    <h1>{component.name}</h1>
                    {component.price && (
                      <span className="text-sm text-muted-foreground">
                        {component.price} €
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </ScrollArea>
            <span className="text-xs text-muted-foreground">
              {data.length} résultats.
            </span>
          </>
        ) : isFetching ? (
          <div
            className="flex items-center justify-center h-30 text-muted-foreground text-sm"
            aria-busy="true"
          >
            <LoaderCircle className="animate-spin mr-2" /> Recherche en cours...
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-30 text-destructive text-sm">
            Une erreur est survenue lors de la recherche de composants.
          </div>
        ) : data && data.length === 0 ? (
          <div className="flex items-center justify-center h-30 text-muted-foreground text-sm">
            Aucun composant trouvé.
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
