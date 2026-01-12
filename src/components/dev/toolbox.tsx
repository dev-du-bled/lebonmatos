"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { WrenchIcon, SunIcon, MoonIcon, MonitorIcon } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type Position = "top-left" | "top-right" | "bottom-left" | "bottom-right";

const positionClasses: Record<Position, string> = {
    "top-left": "top-4 left-4",
    "top-right": "top-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "bottom-right": "bottom-4 right-4",
};

const positionLabels: Record<Position, string> = {
    "top-left": "Haut gauche",
    "top-right": "Haut droite",
    "bottom-left": "Bas gauche",
    "bottom-right": "Bas droite",
};

const themeLabels = {
    light: "Clair",
    dark: "Sombre",
    system: "Système",
};

const themeIcons = {
    light: SunIcon,
    dark: MoonIcon,
    system: MonitorIcon,
};

export function DevToolbox() {
    const { theme, setTheme } = useTheme();
    const [position, setPosition] = React.useState<Position>("bottom-right");
    const [mounted, setMounted] = React.useState(false);

    // Charger la position depuis localStorage au montage
    React.useEffect(() => {
        setMounted(true);
        const savedPosition = localStorage.getItem(
            "dev-toolbox-position"
        ) as Position | null;
        if (savedPosition && positionClasses[savedPosition]) {
            setPosition(savedPosition);
        }
    }, []);

    // Sauvegarder la position dans localStorage
    const handlePositionChange = (newPosition: Position) => {
        setPosition(newPosition);
        localStorage.setItem("dev-toolbox-position", newPosition);
    };

    // // Ne pas rendre côté serveur pour éviter les problèmes d'hydratation
    // if (!mounted) {
    //     return null;
    // }

    const ThemeIcon =
        themeIcons[theme as keyof typeof themeIcons] || MonitorIcon;

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className={`fixed ${positionClasses[position]} z-50 size-10 rounded-full shadow-lg border-2 border-dashed border-orange-500 bg-background/80 backdrop-blur-sm hover:bg-orange-500/10 hover:border-solid transition-all duration-200 cursor-pointer`}
                >
                    <WrenchIcon className="size-5 text-orange-500" />
                    <span className="sr-only">Ouvrir la toolbox dev</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <WrenchIcon className="size-5 text-orange-500" />
                        Toolbox
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    {/* Position du bouton */}
                    <div className="space-y-2">
                        <Label htmlFor="position">Position de la toolbox</Label>
                        <Select
                            value={position}
                            onValueChange={(value) =>
                                handlePositionChange(value as Position)
                            }
                        >
                            <SelectTrigger id="position" className="w-full">
                                <SelectValue placeholder="Choisir une position" />
                            </SelectTrigger>
                            <SelectContent>
                                {(
                                    Object.keys(positionLabels) as Position[]
                                ).map((pos) => (
                                    <SelectItem key={pos} value={pos}>
                                        {positionLabels[pos]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Thème */}
                    <div className="space-y-2">
                        <Label htmlFor="theme">Thème</Label>
                        <Select
                            value={theme}
                            onValueChange={(value) => setTheme(value)}
                        >
                            <SelectTrigger id="theme" className="w-full">
                                <SelectValue placeholder="Choisir un thème">
                                    <span className="flex items-center gap-2">
                                        <ThemeIcon className="size-4" />
                                        {themeLabels[
                                            theme as keyof typeof themeLabels
                                        ] || "Système"}
                                    </span>
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="light">
                                    <SunIcon className="size-4" />
                                    Clair
                                </SelectItem>
                                <SelectItem value="dark">
                                    <MoonIcon className="size-4" />
                                    Sombre
                                </SelectItem>
                                <SelectItem value="system">
                                    <MonitorIcon className="size-4" />
                                    Système
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
