"use client";

import React, { useMemo, useState } from "react";
import { ComponentSelector } from "@/components/configurator/component-selector";
import type { SelectedPost } from "@/components/configurator/component-selector";
import { ComponentType } from "@prisma/client";
import Image from "next/image";
import {
    Trash,
    ArrowLeftRight,
    ArrowUp,
    ArrowDown,
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
    Package,
    ChevronRight,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { COMPONENT_TYPE_LABELS } from "@/lib/compatibility";

type Trend = "up" | "down" | "none";

type Annonce = {
    id: string;
    title: string;
    description?: string;
    price?: number | string;
    imageSrc?: string;
    componentType?: string;
    specs: Record<string, string | number | undefined>;
    trends?: Record<string, Trend>;
};

function humanizeKey(key: string) {
    if (!key) return "";
    // If the key is all-uppercase, keep as-is (acronyms)
    if (key.toUpperCase() === key) return key;
    // Insert spaces before camelCase capitals, then replace underscores/hyphens with spaces
    const spaced = key
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .replace(/[_-]/g, " ");
    return spaced
        .split(" ")
        .map((s) => (s.length === 0 ? s : s[0].toUpperCase() + s.slice(1)))
        .join(" ");
}

function StatRow({
    label,
    value,
    trend = "none",
}: {
    label: string;
    value?: string | number;
    trend?: Trend;
}) {
    const color =
        trend === "up"
            ? "text-emerald-500"
            : trend === "down"
              ? "text-rose-600"
              : "text-neutral-500";
    const Icon =
        trend === "up"
            ? ArrowUp
            : trend === "down"
              ? ArrowDown
              : ArrowLeftRight;

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
    // Selected posts come from ComponentSelector (SelectedPost)
    const [selected, setSelected] = useState<SelectedPost[]>([]);
    const [selectorOpen, setSelectorOpen] = useState(false);
    const [replaceIndex, setReplaceIndex] = useState<number | null>(null);

    // Type picker state (local to comparator)
    const [typePickerOpen, setTypePickerOpen] = useState(false);
    const [pickerType, setPickerType] = useState<ComponentType | undefined>(
        undefined
    );

    // Calculer le type autorisé basé sur la première annonce (si disponible)
    const allowedType = useMemo<ComponentType | undefined>(() => {
        if (selected.length === 0) return undefined;
        return selected[0]?.component?.type ?? undefined;
    }, [selected]);

    function handleSelect(post: SelectedPost) {
        // If in replace mode, replace the selected item at replaceIndex
        if (replaceIndex !== null) {
            setSelected((prev) =>
                prev.map((p, i) => (i === replaceIndex ? post : p))
            );
            setReplaceIndex(null);
        } else {
            // Received full post from selector — add it directly
            setSelected((prev) => {
                if (prev.find((p) => p.id === post.id)) return prev;
                return [...prev, post];
            });
        }
        setSelectorOpen(false);
        // Reset pickerType so subsequent add starts from picker again if all removed
        setPickerType(undefined);
    }

    function handleRemove(id: string) {
        setSelected((prev) => prev.filter((p) => p.id !== id));
    }

    // Map SelectedPost -> Annonce shape used by comparator UI
    // Normalize keys to DB field names so comparison logic matches schema
    const components: Annonce[] = useMemo(() => {
        return selected.map((c) => {
            const specs: Record<string, string | number | undefined> = {};

            // Component basic fields (DB names)
            specs["name"] = c.component?.name;
            specs["type"] = String(c.component?.type ?? "");

            // CPU fields (from model Cpu)
            if (c.component?.Cpu) {
                specs["coreCount"] = c.component.Cpu.coreCount;
                specs["coreClock"] = c.component.Cpu.coreClock;
                specs["boostClock"] = c.component.Cpu.boostClock ?? undefined;
                specs["microarch"] = c.component.Cpu.microarch;
                specs["tdp"] = c.component.Cpu.tdp;
                specs["graphics"] = c.component.Cpu.graphics ?? undefined;
            }

            // GPU fields (from model Gpu)
            if (c.component?.Gpu) {
                specs["chipset"] = c.component.Gpu.chipset;
                specs["memory"] = c.component.Gpu.memory;
                specs["coreClock"] =
                    c.component.Gpu.coreClock ?? specs["coreClock"];
                specs["boostClock"] =
                    c.component.Gpu.boostClock ?? specs["boostClock"];
                specs["length"] = c.component.Gpu.length ?? undefined;
            }

            // Motherboard fields
            if (c.component?.Motherboard) {
                specs["socket"] = c.component.Motherboard.socket;
                specs["formFactor"] = c.component.Motherboard.formFactor;
                specs["maxMemory"] = c.component.Motherboard.maxMemory;
                specs["memorySlots"] = c.component.Motherboard.memorySlots;
            }

            // RAM fields
            if (c.component?.Ram) {
                specs["type"] =
                    (specs["type"] || c.component.Ram.type) ?? specs["type"];
                specs["speed"] = c.component.Ram.speed ?? undefined;
                specs["modules"] = c.component.Ram.modules;
                specs["size"] = c.component.Ram.size;
                specs["casLatency"] = c.component.Ram.casLatency ?? undefined;
            }

            // SSD fields
            if (c.component?.Ssd) {
                specs["capacity"] = c.component.Ssd.capacity;
                specs["cache"] = c.component.Ssd.cache ?? undefined;
                specs["interface"] = c.component.Ssd.interface;
                specs["formFactor"] = c.component.Ssd.formFactor;
            }

            // HDD fields
            if (c.component?.Hdd) {
                specs["capacity"] =
                    specs["capacity"] ?? c.component.Hdd.capacity;
                specs["cache"] =
                    specs["cache"] ?? c.component.Hdd.cache ?? undefined;
                specs["formFactor"] =
                    specs["formFactor"] ?? c.component.Hdd.formFactor;
                specs["interface"] =
                    specs["interface"] ?? c.component.Hdd.interface;
            }

            // PSU fields
            if (c.component?.Psu) {
                specs["psuType"] = c.component.Psu.type;
                specs["wattage"] = c.component.Psu.wattage;
                specs["efficiency"] = c.component.Psu.efficiency ?? undefined;
                specs["modular"] = c.component.Psu.modular ?? undefined;
            }

            // CPU Cooler fields
            if (c.component?.CpuCooler) {
                specs["rpmIdle"] = c.component.CpuCooler.rpmIdle ?? undefined;
                specs["rpmMax"] = c.component.CpuCooler.rpmMax ?? undefined;
                specs["noiseIdle"] =
                    c.component.CpuCooler.noiseIdle ?? undefined;
                specs["noiseMax"] = c.component.CpuCooler.noiseMax ?? undefined;
                specs["size"] = c.component.CpuCooler.size ?? undefined;
            }

            // Case fields
            if (c.component?.Case) {
                specs["caseType"] = c.component.Case.type;
                specs["sidePanel"] = c.component.Case.sidePanel ?? undefined;
                specs["volume"] = c.component.Case.volume ?? undefined;
                specs["bays3_5"] = c.component.Case.bays3_5 ?? undefined;
            }

            // CaseFan fields
            if (c.component?.CaseFan) {
                specs["size"] = specs["size"] ?? c.component.CaseFan.size;
                specs["rpmIdle"] =
                    specs["rpmIdle"] ??
                    c.component.CaseFan.rpmIdle ??
                    undefined;
                specs["rpmMax"] =
                    specs["rpmMax"] ?? c.component.CaseFan.rpmMax ?? undefined;
                specs["noiseIdle"] =
                    specs["noiseIdle"] ??
                    c.component.CaseFan.noiseIdle ??
                    undefined;
                specs["noiseMax"] =
                    specs["noiseMax"] ??
                    c.component.CaseFan.noiseMax ??
                    undefined;
                specs["airflowIdle"] =
                    c.component.CaseFan.airflowIdle ?? undefined;
                specs["airflowMax"] =
                    c.component.CaseFan.airflowMax ?? undefined;
                specs["pwm"] = c.component.CaseFan.pwm ?? undefined;
            }

            // SoundCard fields
            if (c.component?.SoundCard) {
                specs["channels"] = c.component.SoundCard.channels;
                specs["digitalAudio"] =
                    c.component.SoundCard.digitalAudio ?? undefined;
                specs["snr"] = c.component.SoundCard.snr ?? undefined;
                specs["sampleRate"] =
                    c.component.SoundCard.sampleRate ?? undefined;
                specs["chipset"] =
                    specs["chipset"] ??
                    c.component.SoundCard.chipset ??
                    undefined;
                specs["interface"] =
                    specs["interface"] ??
                    c.component.SoundCard.interface ??
                    specs["interface"];
            }

            // WirelessNetworkCard fields
            if (c.component?.WirelessNetworkCard) {
                specs["interface"] =
                    specs["interface"] ??
                    c.component.WirelessNetworkCard.interface;
                specs["protocol"] =
                    c.component.WirelessNetworkCard.protocol ?? undefined;
            }

            // Ensure non-numeric display fields stay stringified
            Object.keys(specs).forEach((k) => {
                const v = specs[k];
                if (
                    v !== undefined &&
                    v !== null &&
                    typeof v !== "string" &&
                    isNaN(Number(v))
                ) {
                    // keep numbers as-is, stringify objects/complex values
                    if (typeof v === "object") specs[k] = String(v);
                }
            });

            return {
                id: c.id,
                title: c.title,
                price: c.price,
                imageSrc: c.images?.[0],
                componentType: String(c.component?.type ?? "").toLowerCase(),
                specs,
                trends: {},
            } as Annonce;
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
        cpu_cooler: new Set([
            "noiseidle",
            "noisemax",
            "noise_idle",
            "noise_max",
            "size",
        ]),
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
        const isInverted =
            globalLowerIsBetter.has(key.toLowerCase()) ||
            typeSpecific.has(key.toLowerCase());

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

    // Calculer les trends pour les prix
    const pricePairs = components
        .map((ex) => {
            const priceValue = ex.price ?? ex.specs?.estimatedPrice;
            return { id: ex.id, value: extractNumber(priceValue) };
        })
        .filter((p) => p.value !== null) as { id: string; value: number }[];

    if (pricePairs.length >= 2) {
        const sum = pricePairs.reduce((acc, p) => acc + p.value, 0);
        const avgPrice = sum / pricePairs.length;

        components.forEach((ex) => {
            const priceValue = ex.price ?? ex.specs?.estimatedPrice;
            const val = extractNumber(priceValue);
            if (val === null) {
                computedTrendsMap[ex.id]["price"] = "none";
            } else if (val > avgPrice) {
                // Prix élevé = mauvais (flèche rouge vers le haut)
                computedTrendsMap[ex.id]["price"] = "down";
            } else if (val < avgPrice) {
                // Prix bas = bon (flèche verte vers le bas)
                computedTrendsMap[ex.id]["price"] = "up";
            } else {
                computedTrendsMap[ex.id]["price"] = "none";
            }
        });
    } else {
        components.forEach((ex) => {
            computedTrendsMap[ex.id]["price"] = "none";
        });
    }

    // Icons mapping (copied from create-post component selector)
    const componentTypeIcons: Record<ComponentType, any> = {
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

    const componentTypes = Object.values(ComponentType) as ComponentType[];

    // Non-numeric keys that should be shown as plain text (not compared numerically)
    const nonNumericKeys = new Set<string>([
        "microarch",
        "chipset",
        "graphics",
        "brand",
        "name",
        "model",
        "socket",
        "interface",
        "type",
        "formFactor",
        "caseType",
        "ramType",
    ]);

    return (
        <div className="min-h-[80vh] p-8 sm:p-12 font-sans">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch h-full">
                {components.map((ex, idx) => {
                    const priceValue = ex.price ?? ex.specs?.estimatedPrice;
                    let priceDisplay: string;
                    if (
                        priceValue === undefined ||
                        priceValue === null ||
                        priceValue === "-"
                    ) {
                        priceDisplay = "-";
                    } else if (typeof priceValue === "number") {
                        priceDisplay = new Intl.NumberFormat("fr-FR", {
                            style: "currency",
                            currency: "EUR",
                            maximumFractionDigits: 0,
                        }).format(priceValue);
                    } else {
                        const s = String(priceValue).trim();
                        // if it already contains a euro sign, keep as-is, otherwise append "€"
                        priceDisplay = s.includes("€") ? s : `${s} €`;
                    }

                    return (
                        <article
                            key={ex.id}
                            className="bg-background border border-neutral-200 rounded-md shadow-sm overflow-hidden"
                        >
                            <div className="relative h-44 bg-neutral-100">
                                {ex.imageSrc ? (
                                    <Image
                                        src={ex.imageSrc}
                                        alt={ex.title}
                                        fill
                                        style={{ objectFit: "cover" }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-neutral-400">
                                        Image
                                    </div>
                                )}
                                <div className="absolute right-3 top-3 flex gap-2">
                                    <Button
                                        type="button"
                                        title="Remplacer"
                                        onClick={() => {
                                            setReplaceIndex(idx);
                                            setSelectorOpen(true);
                                        }}
                                        variant="secondary"
                                        size="icon"
                                    >
                                        <ArrowLeftRight className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        title="Supprimer"
                                        onClick={() => handleRemove(ex.id)}
                                        variant="destructive"
                                        size="icon"
                                    >
                                        <Trash className="h-4 w-4" />
                                    </Button>
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
                                        const trend =
                                            ex.trends?.[key] ??
                                            computedTrendsMap[ex.id]?.[key] ??
                                            "none";
                                        const lowerKey = key.toLowerCase();
                                        if (nonNumericKeys.has(lowerKey)) {
                                            return (
                                                <div
                                                    className="text-center my-3"
                                                    key={key}
                                                >
                                                    <div className="font-semibold">
                                                        {humanizeKey(key)}
                                                    </div>
                                                    <div className="mt-1 text-sm text-neutral-500">
                                                        {value ?? "-"}
                                                    </div>
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
                                    <div className="text-lg font-bold flex items-center gap-2">
                                        <span>À partir de {priceDisplay}</span>
                                        {(() => {
                                            const priceTrend =
                                                computedTrendsMap[ex.id]?.[
                                                    "price"
                                                ] ?? "none";
                                            if (priceTrend === "none")
                                                return null;
                                            const color =
                                                priceTrend === "up"
                                                    ? "text-emerald-500"
                                                    : "text-rose-600";
                                            const Icon =
                                                priceTrend === "up"
                                                    ? ArrowDown
                                                    : ArrowUp;
                                            return (
                                                <Icon
                                                    className={color}
                                                    size={20}
                                                />
                                            );
                                        })()}
                                    </div>
                                    <div />
                                </div>
                            </div>
                        </article>
                    );
                })}

                <Button
                    className="w-full h-full min-h-[500px] flex flex-col items-center justify-center border-2 border-dashed border-neutral-300 rounded-md hover:bg-neutral-50 transition-all group"
                    variant="outline"
                    onClick={() => {
                        if (selected.length === 0) {
                            setTypePickerOpen(true);
                        } else {
                            setSelectorOpen(true);
                        }
                    }}
                >
                    <div className="rounded-full border-2 border-neutral-300 w-20 h-20 flex items-center justify-center text-neutral-400 text-3xl mb-6 group-hover:scale-110 transition-transform">
                        +
                    </div>
                    <div className="text-neutral-500 text-center">
                        <div className="font-semibold text-xl">Ajouter</div>
                        <div className="text-sm">une annonce</div>
                    </div>
                </Button>

                {/* Type picker dialog (only used when there are no selected posts) */}
                <Dialog open={typePickerOpen} onOpenChange={setTypePickerOpen}>
                    <DialogContent className="sm:max-w-lg p-0 gap-0">
                        <DialogHeader className="px-4 pt-4 pb-2">
                            <DialogTitle>Choisir un composant</DialogTitle>
                        </DialogHeader>
                        <div className="p-4">
                            <p className="text-sm text-muted-foreground pb-3">
                                Sélectionnez le type de composant :
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                {componentTypes.map((type) => {
                                    const Icon = componentTypeIcons[type];
                                    return (
                                        <Button
                                            key={type}
                                            variant="outline"
                                            className="h-auto py-3 px-3 justify-start text-left gap-3"
                                            onClick={() => {
                                                setPickerType(type);
                                                setTypePickerOpen(false);
                                                setTimeout(
                                                    () => setSelectorOpen(true),
                                                    150
                                                );
                                            }}
                                        >
                                            <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                                            <span className="truncate flex-1">
                                                {COMPONENT_TYPE_LABELS[type]}
                                            </span>
                                            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                <ComponentSelector
                    open={selectorOpen}
                    onOpenChange={(v) => setSelectorOpen(v)}
                    componentType={
                        (selected.length > 0 ? allowedType : pickerType) ??
                        ComponentType.CPU
                    }
                    onSelect={handleSelect}
                    isAuthenticated={false}
                    excludePostIds={selected.map((s) => s.id)}
                />
            </div>
        </div>
    );
}
