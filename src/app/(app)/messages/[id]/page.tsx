import { trpc } from "@/trpc/server";
import { notFound } from "next/navigation";
import ConversationList from "@/components/messages/conversation-list";
import ConversationView from "@/components/messages/conversation-view";

type Params = { id: string };

export default async function ConversationPage({
    params,
}: {
    params: Promise<Params>;
}) {
    const { id } = await params;

    const [data, discussions] = await Promise.all([
        trpc.discussions.getMessages({ discussionId: id }).catch(() => null),
        trpc.discussions.getDiscussions(),
    ]);

    if (!data) notFound();

    return (
        <div className="mt-4">
            <div
                className="wide-lock-wider flex overflow-hidden bg-background border-x border-t rounded-t-xl"
                style={{
                    height: "calc(100svh - var(--header-height, 76px) - 1rem)",
                }}
            >
                {/* Sidebar — cachée sur mobile */}
                <ConversationList
                    initialDiscussions={discussions}
                    activeId={id}
                    hideOnMobile={true}
                />

                {/* Vue conversation — full width sur mobile */}
                <ConversationView
                    discussionId={id}
                    initialMessages={data.messages}
                    initialHasMore={data.hasMore}
                    initialNextCursor={data.nextCursor}
                    discussion={data.discussion}
                />
            </div>
        </div>
    );
}
