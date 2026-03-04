"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import {
    WrenchIcon,
    SunIcon,
    MoonIcon,
    MonitorIcon,
    CircleHelp,
    MessageSquareDiff,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { trpc } from "@/trpc/client";
import {
    Dialog,
    DialogContent,
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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

type Position = "top-left" | "top-right" | "bottom-left" | "bottom-right";

const defaultUser = {
    email: "dev@example.com",
    password: "azertyuiop",
    username: "default",
    name: "Jean Michel Defaut",
};

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
    const [isLoading, setIsLoading] = React.useState(false);
    const pathname = usePathname();

    // Extraire l'ID de discussion si on est sur /messages/[id]
    const discussionId = React.useMemo(() => {
        const match = pathname.match(/^\/messages\/([a-z0-9]+)$/);
        return match?.[1] ?? null;
    }, [pathname]);

    const devSendSystemMessage =
        trpc.discussions.devSendSystemMessage.useMutation({
            onSuccess: () => toast.success("Message système de test envoyé"),
            onError: (e) => toast.error(e.message),
        });

    // Charger la position depuis localStorage au montage
    React.useEffect(() => {
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

    const createDefaultUser = async () => {
        setIsLoading(true);
        const { error } = await authClient.signUp.email({
            email: defaultUser.email,
            password: defaultUser.password,
            name: defaultUser.name,
            username: defaultUser.username,
        });

        if (error) {
            toast.error(
                error.message || "Erreur lors de la création de l'utilisateur"
            );
            setIsLoading(false);
        } else {
            toast.success("Utilisateur par défaut créé avec succès");
            setIsLoading(false);
        }
    };

    const loginDefaultUser = async () => {
        setIsLoading(true);
        const { error } = await authClient.signIn.email({
            email: defaultUser.email,
            password: defaultUser.password,
        });

        if (error) {
            toast.error(error.message || "Erreur lors de la connexion");
        } else {
            toast.success("Connecté en tant que " + defaultUser.email);
            // window.location.reload();
        }
        setIsLoading(false);
    };

    const deleteDefaultUser = async () => {
        setIsLoading(true);
        const { error } = await authClient.deleteUser();

        if (error) {
            toast.error(
                error.message || "Erreur lors de la suppression du compte"
            );
        } else {
            toast.success("Compte supprimé avec succès");
        }
        setIsLoading(false);
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
                    className={`fixed ${positionClasses[position]} z-70 size-10 rounded-full shadow-lg border-2 border-dashed border-orange-500 bg-background/80 backdrop-blur-sm hover:bg-orange-500/10 hover:border-solid transition-all duration-200 cursor-pointer`}
                >
                    <WrenchIcon className="size-5 text-orange-500" />
                    <span className="sr-only">Ouvrir la toolbox dev</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl max-w-[calc(100vw-2rem)] w-full">
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

                    {/* Message système de test */}
                    {discussionId && (
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <MessageSquareDiff className="size-4 text-orange-500" />
                                Message système (conversation actuelle)
                            </Label>
                            <p className="text-xs text-muted-foreground font-mono truncate">
                                ID : {discussionId}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={devSendSystemMessage.isPending}
                                    onClick={() =>
                                        devSendSystemMessage.mutate({
                                            discussionId,
                                            content:
                                                "Ceci est un message système de test",
                                        })
                                    }
                                >
                                    Simple
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={devSendSystemMessage.isPending}
                                    onClick={() =>
                                        devSendSystemMessage.mutate({
                                            discussionId,
                                            content: "Action requise",
                                            buttonLabel: "Voir l'annonce",
                                            buttonUrl: "/",
                                        })
                                    }
                                >
                                    Avec lien
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={devSendSystemMessage.isPending}
                                    onClick={() =>
                                        devSendSystemMessage.mutate({
                                            discussionId,
                                            content: "Confirmez votre action",
                                            buttonLabel: "Confirmer",
                                            buttonAction: "test_action",
                                        })
                                    }
                                >
                                    Avec action
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={devSendSystemMessage.isPending}
                                    onClick={() =>
                                        devSendSystemMessage.mutate({
                                            discussionId,
                                            content:
                                                "Nouveau message de LeBonMatos",
                                            imageUrls: ["/logo-mini-dark.png"],
                                            buttonLabel: "Voir",
                                            buttonUrl: "/",
                                        })
                                    }
                                >
                                    Avec logo
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Utilisateur par défaut */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Label htmlFor="default-user">
                                Utilisateur par défaut (dev)
                            </Label>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <CircleHelp className="size-4 text-muted-foreground cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <div className="text-xs space-y-1">
                                            <p>
                                                <strong>Email:</strong>{" "}
                                                {defaultUser.email}
                                            </p>
                                            <p>
                                                <strong>Username:</strong>{" "}
                                                {defaultUser.username}
                                            </p>
                                            <p>
                                                <strong>Password:</strong>{" "}
                                                {defaultUser.password}
                                            </p>
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                variant="outline"
                                onClick={createDefaultUser}
                                disabled={isLoading}
                            >
                                Créer
                            </Button>
                            <Button
                                variant="outline"
                                onClick={loginDefaultUser}
                                disabled={isLoading}
                            >
                                Connexion
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={deleteDefaultUser}
                                disabled={isLoading}
                            >
                                Supprimer l&apos;utilisateur actuel
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
