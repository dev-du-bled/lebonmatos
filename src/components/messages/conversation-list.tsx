"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc, type RouterOutputs } from "@/trpc/client";
import { MessageSquare } from "lucide-react";
import { formatRelative } from "date-fns";
import { fr } from "date-fns/locale";
import { type MessageType } from "@prisma/client";

interface ConversationListProps {
    initialDiscussions: RouterOutputs["discussions"]["getDiscussions"];
    activeId: string | null;
    hideOnMobile?: boolean;
}

type DiscussionSummary = RouterOutputs["discussions"]["getDiscussions"][number];

function getLastMessagePreview(msg: DiscussionSummary["lastMessage"]): string {
    if (!msg) return "";
    if (msg.type === ("OFFER" satisfies MessageType))
        return `Offre : ${msg.price} €`;
    if (msg.type === ("SYSTEM" satisfies MessageType)) return msg.content ?? "";
    if (!msg.content && msg.imageUrls.length > 0)
        return msg.imageUrls.length === 1
            ? "📷 Image"
            : `📷 ${msg.imageUrls.length} images`;
    return msg.content ?? "";
}

export default function ConversationList({
    initialDiscussions,
    activeId,
    hideOnMobile = false,
}: ConversationListProps) {
    const { data: discussions = initialDiscussions } =
        trpc.discussions.getDiscussions.useQuery(undefined, {
            initialData: initialDiscussions,
        });

    return (
        <aside
            className={cn(
                "w-full md:w-80 lg:w-96 shrink-0 border-r flex flex-col overflow-hidden bg-background",
                hideOnMobile && "hidden md:flex"
            )}
        >
            <div className="p-4 border-b">
                <h1 className="text-xl sm:text-2xl font-bold font-sans">
                    Messages
                </h1>
            </div>

            <ScrollArea className="flex-1 min-h-0">
                {discussions.length === 0 && (
                    <div className="flex flex-col items-center gap-3 py-16 px-4 text-center text-muted-foreground">
                        <MessageSquare className="size-8 opacity-40" />
                        <p className="text-sm">Aucune conversation</p>
                    </div>
                )}

                {discussions.map((d) => (
                    <Link
                        key={d.id}
                        href={`/messages/${d.id}`}
                        className={cn(
                            "flex items-start gap-3 p-4 border-b hover:bg-accent/50 transition-colors relative group",
                            activeId === d.id && "bg-accent"
                        )}
                    >
                        {/* Thumbnail */}
                        <div className="relative size-14 shrink-0 rounded-lg overflow-hidden bg-muted">
                            <Image
                                src={
                                    d.post.thumbnail ?? "/images/fallback.webp"
                                }
                                alt={d.post.title}
                                fill
                                className="object-cover"
                            />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 pr-6">
                            <p className="font-semibold text-sm line-clamp-1">
                                {d.post.title}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                                {d.otherParty.username ?? "Utilisateur inconnu"}
                            </p>
                            {d.lastMessage && (
                                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                    {getLastMessagePreview(d.lastMessage)}
                                </p>
                            )}
                        </div>

                        {/* Right: date + unread */}
                        <div className="flex flex-col items-end gap-1 shrink-0 absolute right-4 top-4">
                            {d.lastMessage && (
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                    {formatRelative(
                                        new Date(d.lastMessage.sendedAt),
                                        new Date(),
                                        { locale: fr }
                                    )}
                                </span>
                            )}
                            {d.unreadCount > 0 && (
                                <Badge
                                    variant="destructive"
                                    className="text-xs px-1.5 min-w-5 h-5 justify-center"
                                >
                                    {d.unreadCount > 9 ? "9+" : d.unreadCount}
                                </Badge>
                            )}
                        </div>
                    </Link>
                ))}
            </ScrollArea>
        </aside>
    );
}
