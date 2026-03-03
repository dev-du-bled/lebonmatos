import { trpc } from "@/trpc/server";
import ConversationList from "@/components/messages/conversation-list";
import { MessageSquare } from "lucide-react";

export default async function MessagesPage() {
    const discussions = await trpc.discussions.getDiscussions();

    return (
        <div className="mt-4">
            <div
                className="wide-lock-wider flex overflow-hidden bg-background border-x border-t rounded-t-xl"
                style={{
                    height: "calc(100svh - var(--header-height, 76px) - 1rem)",
                }}
            >
                {/* Liste des conversations — full width sur mobile */}
                <ConversationList
                    initialDiscussions={discussions}
                    activeId={null}
                />

                {/* Empty state — visible uniquement sur desktop */}
                <div className="hidden md:flex flex-1 items-center justify-center bg-muted/20">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                        <MessageSquare className="size-12 opacity-30" />
                        <p className="text-sm">Sélectionnez une conversation</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
