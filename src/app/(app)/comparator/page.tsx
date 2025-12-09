"use client";

import React, { useMemo, useState } from "react";
import ComponentChooseDrawer, { ComponentItem } from "@/components/component/choose";
import Image from "next/image";
import { Trash, ArrowLeftRight, ArrowUp, ArrowDown } from "lucide-react";

type Trend = "up" | "down" | "none";

type Component = {
    id: string;
    title: string;
    description?: string;
    price?: number;
    imageSrc?: string;
    componentType?: string;
    specs: Record<string, string | number | undefined>;
    trends?: Record<string, Trend>;
};

function humanizeKey(key: string) {
    if (key.toUpperCase() === key) return key;
    return key
        .replace(/[_-]/g, " ")
        .split(" ")
        .map((s) => (s.length === 0 ? s : s[0].toUpperCase() + s.slice(1)))
        .join(" ");
}

function StatRow({ label, value, trend = "none" }: { label: string; value?: string | number; trend?: Trend }) {
    const color = trend === "up" ? "text-emerald-500" : trend === "down" ? "text-rose-600" : "text-neutral-500";
    const Icon = trend === "up" ? ArrowUp : trend === "down" ? ArrowDown : ArrowLeftRight;

    return (
        <div className="text-center my-3">
            <div className="font-semibold">{label}</div>
            <div className="mt-1 text-sm flex items-center justify-center gap-2">
                <Icon className={`${color}`} size={16} />
                <span className={`${color}`}>{value ?? "-"}</span>
            </div>
        </div>
    );
}

function extractNumber(value: string | number | undefined): number | null {
    if (value === undefined || value === null) return null;
    if (typeof value === "number") return value;
    const s = String(value);
    const match = s.match(/-?\d+(\.\d+)?/);
    if (!match) return null;
    const num = parseFloat(match[0]);
    return Number.isFinite(num) ? num : null;
}

export default function ComparatorPage() {
    const [selected, setSelected] = useState<ComponentItem[]>([]);

    // Calculer le type autorisé basé sur le premier composant
    const allowedType = useMemo(() => {
        if (selected.length === 0) return undefined;
        return selected[0].type;
    }, [selected]);

    async function handleSelect(item: ComponentItem) {
        // Fetch full details for this component
        try {
            const res = await fetch(`/api/components/${item.id}`);
            if (!res.ok) {
                console.error("Failed to fetch component details");
                return;
            }
            const fullComponent = await res.json();

            setSelected((prev) => {
                if (prev.find((p) => p.id === fullComponent.id)) return prev;
                return [...prev, fullComponent];
            });
        } catch (error) {
            console.error("Error fetching component details:", error);
        }
    }

    function handleRemove(id: string) {
        setSelected((prev) => prev.filter((p) => p.id !== id));
    }

    const components: Component[] = useMemo(() => {
        return selected.map((c) => {
            const excludedKeys = ["id", "name", "type", "estimatedPrice"];
            const specs: Record<string, string | number | undefined> = {};

            Object.keys(c).forEach((key) => {
                if (!excludedKeys.includes(key) && c[key] !== null && c[key] !== undefined) {
                    const value = c[key];
                    if (typeof value === "string" || typeof value === "number") {
                        specs[key] = value;
                    } else {
                        specs[key] = String(value);
                    }
                }
            });

            return {
                id: c.id,
                title: c.name,
                price: c.estimatedPrice ?? undefined,
                imageSrc: undefined,
                componentType: c.type?.toLowerCase() ?? undefined,
                specs,
                trends: {},
            };
        });
    }, [selected]);

    const allKeysSet = useMemo(() => {
        const s = new Set<string>();
        components.forEach((ex) => {
            Object.keys(ex.specs || {}).forEach((k) => s.add(k));
        });
        return s;
    }, [components]);

    const allKeys = Array.from(allKeysSet);

    // Attributs où "plus petit = mieux" selon le type de composant
    const lowerIsBetterByType: Record<string, Set<string>> = {
        gpu: new Set(["length", "tdp"]),
        cpu: new Set(["tdp"]),
        ram: new Set(["caslatency", "cas_latency"]),
        cpu_cooler: new Set(["noiseidle", "noisemax", "noise_idle", "noise_max", "size"]),
        case_fan: new Set(["noiseidle", "noisemax", "noise_idle", "noise_max"]),
        case: new Set(["volume"]),
        psu: new Set([]),
        motherboard: new Set([]),
        ssd: new Set([]),
        hdd: new Set([]),
        sound_card: new Set([]),
        wireless_network_card: new Set([]),
    };

    // Attributs globaux où "plus petit = mieux"
    const globalLowerIsBetter = new Set(["tdp", "noise", "latency", "weight"]);

    const computedTrendsMap: Record<string, Record<string, Trend>> = {};
    components.forEach((ex) => {
        computedTrendsMap[ex.id] = {};
    });

    allKeys.forEach((key) => {
        const numericPairs = components
            .map((ex) => ({ id: ex.id, value: extractNumber(ex.specs?.[key]) }))
            .filter((p) => p.value !== null) as { id: string; value: number }[];

        if (numericPairs.length < 2) {
            components.forEach((ex) => {
                computedTrendsMap[ex.id][key] = "none";
            });
            return;
        }

        const sum = numericPairs.reduce((acc, p) => acc + p.value, 0);
        const avg = sum / numericPairs.length;

        // Vérifier si cet attribut doit être inversé
        const componentType = components[0]?.componentType?.toLowerCase() || "";
        const typeSpecific = lowerIsBetterByType[componentType] || new Set();
        const isInverted = globalLowerIsBetter.has(key.toLowerCase()) || typeSpecific.has(key.toLowerCase());

        components.forEach((ex) => {
            const val = extractNumber(ex.specs?.[key]);
            if (val === null) {
                computedTrendsMap[ex.id][key] = "none";
            } else if (val > avg) {
                computedTrendsMap[ex.id][key] = isInverted ? "down" : "up";
            } else if (val < avg) {
                computedTrendsMap[ex.id][key] = isInverted ? "up" : "down";
            } else {
                computedTrendsMap[ex.id][key] = "none";
            }
        });
    });

    return (
        <div className="min-h-screen p-8 sm:p-12 font-sans">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                {components.map((ex) => (
                    <article
                        key={ex.id}
                        className="bg-background border border-neutral-200 rounded-md shadow-sm overflow-hidden"
                    >
                        <div className="relative h-44 bg-neutral-100">
                            {ex.imageSrc ? (
                                <Image src={ex.imageSrc} alt={ex.title} fill style={{ objectFit: "cover" }} />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-neutral-400">
                                    Image
                                </div>
                            )}
                            <div className="absolute right-3 top-3 flex gap-2">
                                <button
                                    type="button"
                                    title="Comparer"
                                    className="hover:cursor-pointer hover:bg-neutral-200 hover:text-neutral-900 p-2 rounded border"
                                >
                                    <ArrowLeftRight />
                                </button>
                                <button
                                    type="button"
                                    title="Supprimer"
                                    onClick={() => handleRemove(ex.id)}
                                    className="hover:cursor-pointer hover:bg-red-700 p-2 rounded border"
                                >
                                    <Trash />
                                </button>
                            </div>
                            <h2 className="absolute left-4 bottom-3 text-white text-xl font-bold drop-shadow-md">
                                {ex.title}
                            </h2>
                        </div>

                        <div className="p-6">
                            <hr className="border-neutral-200 my-4" />

                            <div className="flex flex-col items-center">
                                {allKeys.map((key) => {
                                    const value = ex.specs?.[key];
                                    const trend = ex.trends?.[key] ?? computedTrendsMap[ex.id]?.[key] ?? "none";
                                    const lowerKey = key.toLowerCase();
                                    if (
                                        [
                                            "architecture",
                                            "microarchitecture",
                                            "gpu",
                                            "graphics",
                                            "brand",
                                            "model",
                                        ].includes(lowerKey)
                                    ) {
                                        return (
                                            <div className="text-center my-3" key={key}>
                                                <div className="font-semibold">{humanizeKey(key)}</div>
                                                <div className="mt-1 text-sm text-neutral-500">{value ?? "-"}</div>
                                            </div>
                                        );
                                    }

                                    return (
                                        <StatRow
                                            key={key}
                                            label={humanizeKey(key)}
                                            value={String(value ?? "-")}
                                            trend={trend}
                                        />
                                    );
                                })}
                            </div>

                            <div className="mt-6 flex items-center justify-between">
                                <div className="text-lg font-bold">À partir de {ex.specs?.estimatedPrice ?? "-"} €</div>
                                <a
                                    href="#"
                                    className="bg-yellow-300 hover:bg-yellow-400 text-black px-4 py-2 rounded-md font-medium"
                                >
                                    Rechercher
                                </a>
                            </div>
                        </div>
                    </article>
                ))}

                <ComponentChooseDrawer
                    onSelect={handleSelect}
                    allowedType={allowedType}
                    trigger={
                        <button
                            className="w-full h-full flex flex-col items-center justify-center border-2 border-neutral-300 rounded-md py-16 hover:bg-neutral-50"
                            aria-label="Ajouter un composant"
                        >
                            <div className="rounded-full border-2 border-neutral-300 w-20 h-20 flex items-center justify-center text-neutral-400 text-3xl mb-6">
                                +
                            </div>
                            <div className="text-neutral-500 text-center">
                                <div className="font-semibold">Ajouter</div>
                                <div className="text-sm">un composant</div>
                            </div>
                        </button>
                    }
                />
            </div>
        </div>
    );
}
