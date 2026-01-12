"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
    COMPONENT_TYPE_LABELS,
    type ConfigurationSlot,
    type CompatibilityIssue,
} from "@/lib/compatibility";
import {
    AlertTriangle,
    AlertCircle,
    Share2,
    Save,
    Loader2,
} from "lucide-react";

type ConfigSummaryProps = {
    slots: ConfigurationSlot[];
    totalPrice: number;
    compatibilityIssues: CompatibilityIssue[];
    isComplete: boolean;
    hasStorageComponent: boolean;
    configId?: string;
    isSaving: boolean;
    onSave: () => void;
    onShare: () => void;
    isLoading?: boolean;
};

export function ConfigSummary({
    slots,
    totalPrice,
    compatibilityIssues,
    isComplete,
    hasStorageComponent,
    configId,
    isSaving,
    onSave,
    onShare,
    isLoading,
}: ConfigSummaryProps) {
    if (isLoading) {
        return (
            <div className="space-y-4" id="compatibility-summary">
                <Card className="sticky top-24 shadow-sm overflow-hidden p-0 gap-0">
                    <CardHeader className="bg-muted py-3 px-4">
                        <CardTitle className="text-xl">Récapitulatif</CardTitle>
                    </CardHeader>
                    <Separator />
                    <CardContent className="space-y-6 p-6">
                        <div className="space-y-3">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center">
                            <Skeleton className="h-8 w-24" />
                            <Skeleton className="h-8 w-20" />
                        </div>
                        <div className="space-y-3 pt-2">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const filledSlots = slots.filter((slot) => slot.post);
    const hasSlots = filledSlots.length > 0;

    return (
        <div className="space-y-4" id="compatibility-summary">
            <Card className="sticky top-24 shadow-sm overflow-hidden p-0 gap-0">
                <CardHeader className="py-3 px-4 gap-0">
                    <CardTitle className="text-xl">Récapitulatif</CardTitle>
                </CardHeader>
                <Separator />
                <CardContent className="space-y-6 p-6">
                    {/* Compatibility issues */}
                    {compatibilityIssues.length > 0 && (
                        <div className="space-y-3">
                            {compatibilityIssues.map((issue, i) => (
                                <div
                                    key={i}
                                    className={`flex items-start gap-3 p-3 rounded-lg text-sm border ${
                                        issue.type === "error"
                                            ? "bg-destructive/10 border-destructive/20 text-destructive"
                                            : "bg-yellow-500/10 border-yellow-500/20 text-yellow-600"
                                    }`}
                                >
                                    {issue.type === "error" ? (
                                        <AlertCircle className="size-5 shrink-0" />
                                    ) : (
                                        <AlertTriangle className="size-5 shrink-0" />
                                    )}
                                    <span className="font-medium">
                                        {issue.message}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Warnings */}
                    {!isComplete && (
                        <div className="flex items-start gap-3 p-3 rounded-lg text-sm bg-blue-500/10 border border-blue-500/20 text-blue-600">
                            <AlertCircle className="size-5 shrink-0" />
                            <span className="font-medium">
                                La configuration est incomplète
                            </span>
                        </div>
                    )}
                    {isComplete && !hasStorageComponent && (
                        <div className="flex items-start gap-3 p-3 rounded-lg text-sm bg-orange-500/10 border border-orange-500/20 text-orange-600">
                            <AlertTriangle className="size-5 shrink-0" />
                            <span className="font-medium">
                                Pensez à ajouter du stockage (SSD/HDD)
                            </span>
                        </div>
                    )}

                    {/* Items list */}
                    <div className="space-y-3">
                        {filledSlots.map((slot) => (
                            <div
                                key={slot.componentType}
                                className="flex justify-between text-sm items-center"
                            >
                                <span className="text-muted-foreground truncate pr-4 flex-1">
                                    {COMPONENT_TYPE_LABELS[slot.componentType]}
                                </span>
                                <span className="font-medium whitespace-nowrap">
                                    {slot.post!.price * slot.quantity} €
                                </span>
                            </div>
                        ))}
                    </div>

                    <Separator />

                    {/* Total */}
                    <div className="flex justify-between items-center">
                        <span className="text-lg font-bold">Total estimé</span>
                        <span className="text-2xl font-bold text-primary-600">
                            {totalPrice} €
                        </span>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3 pt-2">
                        <Button
                            className="w-full h-12 text-base font-semibold shadow-sm"
                            onClick={onSave}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <Loader2 className="size-5 mr-2 animate-spin" />
                            ) : (
                                <Save className="size-5 mr-2" />
                            )}
                            {configId
                                ? "Mettre à jour"
                                : "Enregistrer la config"}
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full h-10"
                            onClick={onShare}
                            disabled={!hasSlots || isSaving}
                        >
                            <Share2 className="size-4 mr-2" />
                            Partager le lien
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
