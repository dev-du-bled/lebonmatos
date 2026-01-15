"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Copy, Check, Loader2 } from "lucide-react";

type SaveDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    name: string;
    onNameChange: (name: string) => void;
    onConfirm: () => void;
    isPending: boolean;
};

export function SaveDialog({
    open,
    onOpenChange,
    name,
    onNameChange,
    onConfirm,
    isPending,
}: SaveDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Enregistrer la configuration</DialogTitle>
                    <DialogDescription>
                        Donnez un nom à votre configuration pour la retrouver
                        facilement.
                    </DialogDescription>
                </DialogHeader>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        onConfirm();
                    }}
                >
                    <div className="py-4">
                        <Input
                            placeholder="Nom de la configuration"
                            value={name}
                            onChange={(e) => onNameChange(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            disabled={isPending || !name.trim()}
                        >
                            {isPending ? (
                                <Loader2 className="size-4 mr-2 animate-spin" />
                            ) : null}
                            Enregistrer
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

type ShareDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    shareUrl: string;
};

export function ShareDialog({
    open,
    onOpenChange,
    shareUrl,
}: ShareDialogProps) {
    const [copied, setCopied] = useState(false);

    const handleCopyUrl = async () => {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Partager la configuration</DialogTitle>
                    <DialogDescription>
                        Copiez ce lien pour partager votre configuration avec
                        vos amis.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex gap-2 py-4">
                    <Input value={shareUrl} readOnly className="flex-1" />
                    <Button onClick={handleCopyUrl}>
                        {copied ? (
                            <Check className="size-4" />
                        ) : (
                            <Copy className="size-4" />
                        )}
                    </Button>
                </div>
                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)}>Fermer</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

type LoginPromptDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function LoginPromptDialog({
    open,
    onOpenChange,
}: LoginPromptDialogProps) {
    const router = useRouter();

    const handleLoginRedirect = () => {
        router.push(`/login?redirect=/configurator`);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Connexion requise</DialogTitle>
                    <DialogDescription>
                        Vous devez être connecté pour enregistrer ou partager
                        votre configuration. Votre configuration actuelle sera
                        conservée.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Annuler
                    </Button>
                    <Button onClick={handleLoginRedirect}>Se connecter</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
