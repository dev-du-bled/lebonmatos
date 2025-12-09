import React, { useEffect, useMemo, useState } from "react";

type ComponentType =
    | "CPU"
    | "GPU"
    | "MOTHERBOARD"
    | "RAM"
    | "SSD"
    | "HDD"
    | "POWER_SUPPLY"
    | "CPU_COOLER"
    | "CASE"
    | "CASE_FAN"
    | "SOUND_CARD"
    | "WIRELESS_NETWORK_CARD";

export interface ComponentItem {
    id: string;
    name: string;
    estimatedPrice?: number | null;
    color?: string | null;
    type: ComponentType;
    [key: string]: any;
}

export type ComponentChooseDrawerProps = {
    onSelect?: (component: ComponentItem) => void;
    trigger?: React.ReactNode;
    initialOpen?: boolean;
    allowedType?: ComponentType;
};

export default function ComponentChooseDrawer({
    onSelect,
    trigger,
    initialOpen = false,
    allowedType,
}: ComponentChooseDrawerProps) {
    const [open, setOpen] = useState<boolean>(initialOpen);
    const [components, setComponents] = useState<ComponentItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [query, setQuery] = useState<string>("");
    const [typeFilter, setTypeFilter] = useState<string>("ALL");

    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);

    useEffect(() => {
        if (!open) return;
        if (allowedType) {
            setTypeFilter(allowedType);
        } else {
            setTypeFilter("ALL");
        }
    }, [allowedType, open]);

    useEffect(() => {
        if (!open) return;

        if (allowedType) {
            setComponents([]);
            setPage(1);
        }

        let isActive = true;
        const controller = new AbortController();
        async function load() {
            setLoading(true);
            setError(null);
            try {
                const base = "/api/components";
                const params = new URLSearchParams();
                if (allowedType) params.set("type", allowedType);
                params.set("_ts", String(Date.now()));
                const url = `${base}${params.toString() ? `?${params.toString()}` : ""}`;

                const res = await fetch(url, { signal: controller.signal, cache: "no-store" });
                if (!res.ok) {
                    throw new Error(`Failed to fetch components: ${res.status} ${res.statusText}`);
                }
                const data = (await res.json()) as ComponentItem[];
                if (isActive) {
                    setComponents(data);
                }
            } catch (err: unknown) {
                if (controller.signal.aborted) {
                    return;
                }
                console.error("Error fetching components", err);
                if (isActive) {
                    let message = "Unknown error";
                    if (err instanceof Error) message = err.message;
                    else if (typeof err === "string") message = err;
                    else {
                        try {
                            message = JSON.stringify(err);
                        } catch {
                            // ignore
                        }
                    }
                    setError(message);
                }
            } finally {
                if (isActive) setLoading(false);
            }
        }
        void load();
        return () => {
            isActive = false;
            controller.abort();
        };
    }, [allowedType, open]);

    const TYPES: string[] = useMemo(
        () => [
            "ALL",
            "CPU",
            "GPU",
            "MOTHERBOARD",
            "RAM",
            "SSD",
            "HDD",
            "POWER_SUPPLY",
            "CPU_COOLER",
            "CASE",
            "CASE_FAN",
            "SOUND_CARD",
            "WIRELESS_NETWORK_CARD",
        ],
        []
    );

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return components.filter((c) => {
            if (allowedType && c.type !== allowedType) return false;
            if (typeFilter !== "ALL" && c.type !== typeFilter) return false;
            if (!q) return true;
            return (
                c.name.toLowerCase().includes(q) ||
                (c.color ?? "").toLowerCase().includes(q) ||
                (c.estimatedPrice ?? "").toString().toLowerCase().includes(q)
            );
        });
    }, [components, query, typeFilter, allowedType]);

    useEffect(() => {
        setPage(1);
    }, [query, typeFilter, pageSize, filtered.length]);

    const totalPages = useMemo(() => {
        return Math.max(1, Math.ceil(filtered.length / Math.max(1, pageSize)));
    }, [filtered.length, pageSize]);

    useEffect(() => {
        if (page > totalPages) setPage(totalPages);
        if (page < 1) setPage(1);
    }, [page, totalPages]);

    const paginated = useMemo(() => {
        const p = Math.max(1, page);
        const size = Math.max(1, pageSize);
        const start = (p - 1) * size;
        return filtered.slice(start, start + size);
    }, [filtered, page, pageSize]);

    function handleSelect(item: ComponentItem) {
        if (onSelect) onSelect(item);
        setOpen(false);
    }

    return (
        <>
            {trigger ? (
                <span onClick={() => setOpen(true)} style={{ display: "inline-block" }}>
                    {trigger}
                </span>
            ) : (
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Choisir un composant
                </button>
            )}

            <div
                aria-hidden={!open}
                className={`fixed inset-0 bg-black/40 z-90 transition-opacity ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
                onClick={() => setOpen(false)}
            />

            <aside
                role="dialog"
                aria-modal="true"
                aria-label="Choisir un composant"
                className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 flex flex-col z-100 ${
                    open ? "translate-x-0" : "translate-x-full"
                }`}
            >
                <div className="px-4 py-3 border-b flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-medium">Sélectionner un composant</h3>
                        <p className="text-sm text-muted-foreground">
                            Parcourez et choisissez un composant depuis la base de données.
                        </p>
                        {allowedType ? (
                            <div className="mt-1 text-sm text-gray-600">
                                Sélection limitée au type: <strong>{allowedType}</strong>
                            </div>
                        ) : null}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setQuery("");
                                setTypeFilter(allowedType ? allowedType : "ALL");
                                setPageSize(10);
                            }}
                            className="text-sm text-gray-600 hover:text-gray-800"
                        >
                            Réinitialiser
                        </button>
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            aria-label="Close"
                            className="p-2 rounded hover:bg-gray-100"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                <div className="p-4 flex-1 overflow-y-auto">
                    <div className="mb-4 space-y-3">
                        <label className="block">
                            <span className="sr-only">Recherche</span>
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Rechercher par nom, couleur, prix estimé..."
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </label>

                        <div className="flex gap-2">
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="px-3 py-2 border rounded-md bg-white"
                                disabled={!!allowedType}
                            >
                                {TYPES.map((t) => (
                                    <option key={t} value={t}>
                                        {t}
                                    </option>
                                ))}
                            </select>

                            <div className="ml-auto text-sm text-gray-600 flex items-center gap-2">
                                <span>{filtered.length}</span>
                                <span>résultats</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        {loading ? (
                            <div className="py-8 text-center text-gray-600">Chargement des composants…</div>
                        ) : error ? (
                            <div className="py-8 text-center text-red-600">Erreur: {error}</div>
                        ) : filtered.length === 0 ? (
                            <div className="py-8 text-center text-gray-500">Aucun composant trouvé</div>
                        ) : (
                            <>
                                <ul className="space-y-2">
                                    {paginated.map((c) => (
                                        <li
                                            key={c.id}
                                            className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50"
                                        >
                                            <div>
                                                <div className="font-medium">{c.name}</div>
                                                <div className="text-sm text-gray-500">
                                                    {c.type} {c.color ? `· ${c.color}` : ""}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {typeof c.estimatedPrice === "number" ? (
                                                    <div className="text-sm font-medium">{c.estimatedPrice} €</div>
                                                ) : (
                                                    <div className="text-sm text-gray-400">—</div>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => handleSelect(c)}
                                                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                                                >
                                                    Sélectionner
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-4 flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                                            disabled={page <= 1}
                                            className={`px-2 py-1 rounded border ${page <= 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"}`}
                                        >
                                            ← Préc
                                        </button>

                                        <div className="flex items-center gap-1">
                                            <span className="text-sm text-gray-600">Page</span>
                                            <span className="px-2 py-1 border rounded bg-gray-50 text-sm">{page}</span>
                                            <span className="text-sm text-gray-600">/ {totalPages}</span>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                            disabled={page >= totalPages}
                                            className={`px-2 py-1 rounded border ${page >= totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"}`}
                                        >
                                            Suiv →
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <label className="text-sm text-gray-600">Par page:</label>
                                        <select
                                            value={pageSize}
                                            onChange={(e) => {
                                                setPageSize(Number(e.target.value));
                                                setPage(1);
                                            }}
                                            className="px-2 py-1 border rounded bg-white text-sm"
                                        >
                                            {[5, 10, 20, 50].map((s) => (
                                                <option key={s} value={s}>
                                                    {s}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="p-4 border-t flex items-center justify-between">
                    <div className="text-sm text-gray-600">Total composants: {components.length}</div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setOpen(false);
                            }}
                            className="px-3 py-1 rounded border hover:bg-gray-50"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
