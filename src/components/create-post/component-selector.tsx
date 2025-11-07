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
  formatEnumType,
  getComponentData,
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

interface ComponentSelectorProps {
  selectedComponent: ReturnedComponent | null;
  setSelectedComponent: (component: ReturnedComponent | null) => void;
}

export default function ComponentSelector({
  selectedComponent,
  setSelectedComponent,
}: ComponentSelectorProps) {
  const componentTypes = Object.values(ComponentType);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [type, setType] = useState<ComponentType | undefined>(undefined);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  const { data, isFetching } = trpc.components.getComponents.useQuery(
    {
      query: debouncedQuery,
      type: type as ComponentType,
    },
    {
      enabled: type !== undefined && debouncedQuery.length >= 3,
    }
  );

  return (
    <Card>
      <CardContent className="space-y-2">
        <CardHeader className="p-0 mb-4">
          <CardTitle>Sélectionner un composant</CardTitle>
          <CardDescription>
            Sélectionner un composant pour créer votre annonce.
          </CardDescription>
        </CardHeader>

        <Select
          onValueChange={(value) => {
            setType(value as ComponentType);
            setSelectedComponent(null);
          }}
          value={type}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sélectionner un composant" />
          </SelectTrigger>
          <SelectContent>
            {componentTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {formatEnumType(type)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative">
          <Input
            value={query}
            disabled={type === undefined || isFetching}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un composant..."
            className="pr-8"
          />
          <button
            onClick={() => {
              setDebouncedQuery("");
              setQuery("");
            }}
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

        {isFetching ? (
          <div
            className="flex items-center justify-center h-30 text-muted-foreground text-sm"
            aria-busy="true"
          >
            <LoaderCircle className="animate-spin mr-2" /> Recherche en cours...
          </div>
        ) : data && data.length > 0 ? (
          <div className="mt-2 overflow-y-auto max-h-64 pr-1">
            {data.map((component) => (
              <div
                key={component.id}
                className={`cursor-pointer hover:bg-accent border border-transparent hover:border-primary rounded-md p-2 ${
                  selectedComponent?.id === component.id && "bg-accent"
                }`}
                onClick={() =>
                  setSelectedComponent(
                    getComponentData(
                      component.type,
                      component as ReturnedComponent
                    )
                  )
                }
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
          </div>
        ) : debouncedQuery.length >= 3 && type !== undefined ? (
          <div className="flex items-center justify-center h-30 text-muted-foreground text-sm">
            Aucun composant trouvé.
          </div>
        ) : null}

        {selectedComponent && Object.keys(selectedComponent).length > 0 && (
          <div className="mt-4 p-4 border border-secondary rounded-md overflow-scroll">
            <h2 className="font-semibold mb-2">{selectedComponent.name}</h2>
            {formatComponentData(
              selectedComponent.type,
              selectedComponent.data as Components
            ).map((displayUnit, index) => (
              <div key={index} className="text-sm text-muted-foreground">
                {displayUnit}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
