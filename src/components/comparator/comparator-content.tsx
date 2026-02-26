"use client";

import React, { useMemo, useState } from "react";

import { ComponentSelector, type SelectedPost } from "@/components/configurator/component-selector";
import { ComponentType } from "@prisma/client";

import {
    Cpu,
    MonitorUp,
    CircuitBoard,
    MemoryStick,
    HardDrive,
    Database,
    Plug,
    Fan,
    Box,
    Wind,
    AudioLines,
    Wifi,
    ChevronRight,
} from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { COMPONENT_TYPE_LABELS } from "@/lib/compatibility";

import ComparatorCarousel from "./comparator-carousel";

import { extractNumber, Trend, humanizeKey } from "./comparator-utils";

import { mapSelectedToAnnonce, Annonce } from "./comparator-mapper";

/* ===================================== */

export default function ComparatorContent() {
    /* ---------- STATE ---------- */

    const [selected, setSelected] = useState<SelectedPost[]>([]);
    const [selectorOpen, setSelectorOpen] = useState(false);
    const [replaceIndex, setReplaceIndex] = useState<number | null>(null);

    const [typePickerOpen, setTypePickerOpen] = useState(false);
    const [pickerType, setPickerType] = useState<ComponentType>();

    // Type persisté dès la première sélection — source de vérité pour toute la session de comparaison
    const [comparisonType, setComparisonType] = useState<ComponentType | undefined>();

    /* ---------- TYPE ---------- */

    // Alias pour la lisibilité dans le JSX
    const allowedType = comparisonType;

    /* ---------- HANDLERS ---------- */

    function handleSelect(post: SelectedPost) {
        if (replaceIndex !== null) {
            setSelected((p) => p.map((x, i) => (i === replaceIndex ? post : x)));
            setReplaceIndex(null);
        } else {
            // Premier ajout : on mémorise le type pour toute la session de comparaison
            if (!selected.length) {
                const type = post.componentType ?? pickerType;
                if (type) setComparisonType(type);
            }
            setSelected((p) => [...p, post]);
        }

        setSelectorOpen(false);
        setPickerType(undefined);
    }

    function handleRemove(id: string) {
        setSelected((p) => {
            const next = p.filter((x) => x.id !== id);
            // On réinitialise le type de comparaison quand la liste est entièrement vidée
            if (next.length === 0) setComparisonType(undefined);
            return next;
        });
    }

    /* ---------- DATA ---------- */

    const components: Annonce[] = useMemo(() => {
        return mapSelectedToAnnonce(selected);
    }, [selected]);

    /* ---------- KEYS ---------- */

    const allKeys = useMemo(() => {
        const s = new Set<string>();

        components.forEach((c) => Object.keys(c.specs).forEach((k) => s.add(k)));

        return Array.from(s);
    }, [components]);

    /* ---------- TRENDS ---------- */

    const computedTrendsMap = useMemo(() => {
        const map: Record<string, Record<string, Trend>> = {};

        components.forEach((c) => (map[c.id] = {}));

        // Keys where lower value is considered better (e.g. price, tdp)
        const lowerIsBetter = new Set(["price", "tdp"]);

        allKeys.forEach((key) => {
            const nums = components
                .map((c) => ({
                    id: c.id,
                    v: extractNumber(c.specs[key]),
                }))
                .filter((x) => x.v !== null) as {
                id: string;
                v: number;
            }[];

            if (nums.length < 2) {
                components.forEach((c) => {
                    map[c.id][key] = "none";
                });
                return;
            }

            const avg = nums.reduce((a, b) => a + b.v, 0) / nums.length;

            const keyLower = key.toLowerCase();
            const invert = lowerIsBetter.has(keyLower);

            components.forEach((c) => {
                const val = extractNumber(c.specs[key]);

                if (val === null) {
                    map[c.id][key] = "none";
                    return;
                }

                if (!invert) {
                    if (val > avg) map[c.id][key] = "up";
                    else if (val < avg) map[c.id][key] = "down";
                    else map[c.id][key] = "none";
                } else {
                    // For keys where lower is better, invert the interpretation:
                    // a value lower than average is an "up" (better), higher is "down" (worse)
                    if (val < avg) map[c.id][key] = "up";
                    else if (val > avg) map[c.id][key] = "down";
                    else map[c.id][key] = "none";
                }
            });
        });

        return map;
    }, [components, allKeys]);

    /* ---------- NON NUMERIC ---------- */

    const nonNumericKeys = useMemo(() => new Set(["type", "chipset", "socket", "interface", "brand"]), []);

    /* ---------- ICONS ---------- */

    const componentTypeIcons: Record<ComponentType, React.ComponentType<unknown>> = {
        CPU: Cpu,
        GPU: MonitorUp,
        MOTHERBOARD: CircuitBoard,
        RAM: MemoryStick,
        SSD: HardDrive,
        HDD: Database,
        POWER_SUPPLY: Plug,
        CPU_COOLER: Fan,
        CASE: Box,
        CASE_FAN: Wind,
        SOUND_CARD: AudioLines,
        WIRELESS_NETWORK_CARD: Wifi,
    };

    const componentTypes = Object.values(ComponentType);

    /* ===================================== */

    return (
        <div className="min-h-[80vh] p-8 sm:p-12">
            {/* CAROUSEL */}
            <ComparatorCarousel
                components={components}
                allKeys={allKeys}
                nonNumericKeys={nonNumericKeys}
                trends={computedTrendsMap}
                onRemove={handleRemove}
                onReplace={(i) => {
                    setReplaceIndex(i);
                    setSelectorOpen(true);
                }}
                onAdd={() => {
                    if (!selected.length) setTypePickerOpen(true);
                    else setSelectorOpen(true);
                }}
                humanizeKey={humanizeKey}
            />

            {/* TYPE PICKER */}
            <Dialog open={typePickerOpen} onOpenChange={setTypePickerOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Choisir un composant</DialogTitle>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-2">
                        {componentTypes.map((type) => {
                            const Icon = componentTypeIcons[type];

                            return (
                                <Button
                                    key={type}
                                    variant="outline"
                                    className="justify-start gap-3"
                                    onClick={() => {
                                        setPickerType(type);
                                        setTypePickerOpen(false);
                                        setTimeout(() => setSelectorOpen(true), 150);
                                    }}
                                >
                                    <Icon size={16} />
                                    {COMPONENT_TYPE_LABELS[type]}
                                    <ChevronRight className="ml-auto" />
                                </Button>
                            );
                        })}
                    </div>
                </DialogContent>
            </Dialog>

            {/* SELECTOR */}
            <ComponentSelector
                open={selectorOpen}
                onOpenChange={setSelectorOpen}
                componentType={(selected.length ? allowedType : pickerType) ?? pickerType ?? ComponentType.CPU}
                onSelect={handleSelect}
                isAuthenticated={false}
                excludePostIds={selected.map((s) => s.id)}
            />
        </div>
    );
}
