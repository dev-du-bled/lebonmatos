"use client";

import {
    useState,
    useEffect,
    useLayoutEffect,
    useRef,
    useMemo,
    useCallback,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { trpc, type RouterOutputs } from "@/trpc/client";
import { useSession } from "@/components/auth/session-provider";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
    Send,
    Tag,
    CircleDollarSign,
    ArrowLeft,
    Check,
    CheckCheck,
    Loader,
    ImageIcon,
    X,
    Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { type MessageEvent } from "@/lib/message-emitter";
import { type MessageType } from "@prisma/client";

type GetMessagesOutput = RouterOutputs["discussions"]["getMessages"];
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { useUploadThing } from "@/utils/uploadthing";
import { useLightbox } from "@/components/ui/lightbox";
import { Skeleton } from "@/components/ui/skeleton";

type PendingMessage = {
    tempId: string;
    content: string | null;
    price: number | null;
    imageUrls: string[];
    type: Exclude<MessageType, "SYSTEM">;
    sendedAt: string;
};

interface ConversationViewProps {
    discussionId: string;
    initialMessages: GetMessagesOutput["messages"];
    initialHasMore: boolean;
    initialNextCursor?: string;
    discussion: GetMessagesOutput["discussion"];
    onSystemAction?: (action: string, discussionId: string) => void;
}

function MessageSkeleton({ isOwn }: { isOwn: boolean }) {
    return (
        <div
            className={cn(
                "flex gap-2 animate-pulse",
                isOwn ? "flex-row-reverse" : "flex-row"
            )}
        >
            {!isOwn && (
                <div className="size-8 rounded-full bg-muted shrink-0" />
            )}
            <div
                className={cn(
                    "flex flex-col gap-1.5",
                    isOwn ? "items-end" : "items-start"
                )}
            >
                <div
                    className={cn(
                        "h-10 rounded-xl bg-muted",
                        isOwn ? "w-36" : "w-48"
                    )}
                />
                <div className="h-3 w-8 rounded bg-muted" />
            </div>
        </div>
    );
}

function MessageStatus({
    isOwn,
    viewed,
    pending,
}: {
    isOwn: boolean;
    viewed: boolean;
    pending?: boolean;
}) {
    if (!isOwn) return null;
    if (pending)
        return <Loader className="size-3 animate-spin text-muted-foreground" />;
    if (viewed) return <CheckCheck className="size-3.5 text-primary" />;
    return <Check className="size-3.5 text-muted-foreground" />;
}

function ImageCell({
    url,
    square,
    onClick,
}: {
    url: string;
    square: boolean;
    onClick: () => void;
}) {
    const [loaded, setLoaded] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    // Si l'image est déjà en cache, l'event "load" se déclenche avant que React
    // n'attache le handler onLoad. On vérifie img.complete après le paint.
    useLayoutEffect(() => {
        if (imgRef.current?.complete) setLoaded(true);
    }, [url]);

    return (
        <div
            className={cn(
                "relative overflow-hidden bg-muted",
                square ? "aspect-square" : "h-40"
            )}
        >
            {!loaded && (
                <Skeleton className="absolute inset-0 z-10 rounded-none" />
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                ref={imgRef}
                src={url}
                alt=""
                className={cn(
                    "w-full h-full cursor-pointer object-cover transition-opacity hover:opacity-90",
                    !loaded && "opacity-0"
                )}
                onLoad={() => setLoaded(true)}
                onClick={onClick}
            />
        </div>
    );
}

function ImageGrid({ urls, pending }: { urls: string[]; pending?: boolean }) {
    const open = useLightbox();
    if (urls.length === 0) return null;
    const count = urls.length;
    return (
        <div
            className={cn(
                "grid gap-0.5 overflow-hidden rounded-xl",
                pending && "opacity-60"
            )}
            style={{ maxWidth: 240 }}
        >
            {count === 1 && (
                <ImageCell
                    url={urls[0]!}
                    square={false}
                    onClick={() => open(urls, 0)}
                />
            )}
            {count === 2 && (
                <div className="grid grid-cols-2 gap-0.5">
                    {urls.map((url, i) => (
                        <ImageCell
                            key={i}
                            url={url}
                            square
                            onClick={() => open(urls, i)}
                        />
                    ))}
                </div>
            )}
            {count === 3 && (
                <>
                    <ImageCell
                        url={urls[0]!}
                        square={false}
                        onClick={() => open(urls, 0)}
                    />
                    <div className="grid grid-cols-2 gap-0.5">
                        <ImageCell
                            url={urls[1]!}
                            square
                            onClick={() => open(urls, 1)}
                        />
                        <ImageCell
                            url={urls[2]!}
                            square
                            onClick={() => open(urls, 2)}
                        />
                    </div>
                </>
            )}
            {count === 4 && (
                <div className="grid grid-cols-2 gap-0.5">
                    {urls.map((url, i) => (
                        <ImageCell
                            key={i}
                            url={url}
                            square
                            onClick={() => open(urls, i)}
                        />
                    ))}
                </div>
            )}
            {count === 5 && (
                <>
                    <div className="grid grid-cols-3 gap-0.5">
                        {urls.slice(0, 3).map((url, i) => (
                            <ImageCell
                                key={i}
                                url={url}
                                square
                                onClick={() => open(urls, i)}
                            />
                        ))}
                    </div>
                    <div className="grid grid-cols-2 gap-0.5">
                        {urls.slice(3).map((url, i) => (
                            <ImageCell
                                key={i + 3}
                                url={url}
                                square
                                onClick={() => open(urls, i + 3)}
                            />
                        ))}
                    </div>
                </>
            )}
            {count === 6 && (
                <div className="grid grid-cols-3 gap-0.5">
                    {urls.map((url, i) => (
                        <ImageCell
                            key={i}
                            url={url}
                            square
                            onClick={() => open(urls, i)}
                        />
                    ))}
                </div>
            )}
            {count === 7 && (
                <>
                    <div className="grid grid-cols-4 gap-0.5">
                        {urls.slice(0, 4).map((url, i) => (
                            <ImageCell
                                key={i}
                                url={url}
                                square
                                onClick={() => open(urls, i)}
                            />
                        ))}
                    </div>
                    <div className="grid grid-cols-3 gap-0.5">
                        {urls.slice(4).map((url, i) => (
                            <ImageCell
                                key={i + 4}
                                url={url}
                                square
                                onClick={() => open(urls, i + 4)}
                            />
                        ))}
                    </div>
                </>
            )}
            {count === 8 && (
                <div className="grid grid-cols-4 gap-0.5">
                    {urls.map((url, i) => (
                        <ImageCell
                            key={i}
                            url={url}
                            square
                            onClick={() => open(urls, i)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function MessageBubble({
    msg,
    isOwn,
    pending,
    showMeta = true,
    onSystemAction,
    discussionId,
}: {
    msg: MessageEvent | PendingMessage;
    isOwn: boolean;
    pending?: boolean;
    showMeta?: boolean;
    onSystemAction?: (action: string, discussionId: string) => void;
    discussionId: string;
}) {
    const time = format(new Date(msg.sendedAt), "HH:mm", { locale: fr });
    const viewed = "viewed" in msg ? msg.viewed : false;
    const type = msg.type;
    const imageUrls = "imageUrls" in msg ? (msg.imageUrls ?? []) : [];

    if (type === "SYSTEM") {
        const buttonLabel = "buttonLabel" in msg ? msg.buttonLabel : null;
        const buttonUrl = "buttonUrl" in msg ? msg.buttonUrl : null;
        const buttonAction = "buttonAction" in msg ? msg.buttonAction : null;
        const content = "content" in msg ? msg.content : "";

        return (
            <div className="flex justify-center my-2">
                <div className="bg-muted rounded-xl px-4 py-3 max-w-xs text-center space-y-2">
                    {imageUrls.length > 0 && <ImageGrid urls={imageUrls} />}
                    <div className="flex items-center justify-center gap-1.5">
                        <Info className="size-3 text-muted-foreground shrink-0" />
                        <span className="text-xs text-muted-foreground">
                            {content}
                        </span>
                    </div>
                    {buttonLabel &&
                        (buttonUrl || buttonAction) &&
                        (buttonUrl ? (
                            <Link href={buttonUrl}>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full text-xs h-7"
                                >
                                    {buttonLabel}
                                </Button>
                            </Link>
                        ) : (
                            <Button
                                size="sm"
                                variant="outline"
                                className="w-full text-xs h-7"
                                onClick={() =>
                                    buttonAction &&
                                    onSystemAction?.(buttonAction, discussionId)
                                }
                            >
                                {buttonLabel}
                            </Button>
                        ))}
                </div>
            </div>
        );
    }

    if (type === "OFFER") {
        return (
            <div
                className={cn(
                    "flex flex-col gap-0.5",
                    isOwn ? "items-end" : "items-start"
                )}
            >
                <div
                    className={cn(
                        "flex gap-2 items-end",
                        isOwn ? "flex-row-reverse" : "flex-row"
                    )}
                >
                    {!isOwn &&
                        (showMeta ? (
                            <Avatar className="size-8 shrink-0">
                                <AvatarImage
                                    src={
                                        "author" in msg && msg.author?.image
                                            ? msg.author.image
                                            : undefined
                                    }
                                />
                                <AvatarFallback>
                                    {"author" in msg
                                        ? (msg.author?.name?.charAt(0) ?? "?")
                                        : "?"}
                                </AvatarFallback>
                            </Avatar>
                        ) : (
                            <div className="size-8 shrink-0" />
                        ))}
                    <div
                        className={cn(
                            "flex flex-col gap-1 max-w-[200px]",
                            isOwn && "items-end"
                        )}
                    >
                        <div
                            className={cn(
                                "rounded-xl px-5 py-3 text-center border-2",
                                isOwn
                                    ? "bg-primary/10 border-primary"
                                    : "bg-muted border-border",
                                pending && "opacity-60"
                            )}
                        >
                            <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground mb-1">
                                <CircleDollarSign className="size-4" />
                                <span>Offre</span>
                            </div>
                            <p className="text-2xl font-bold">{msg.price} €</p>
                        </div>
                    </div>
                </div>
                {showMeta && (
                    <div
                        className={cn(
                            "flex items-center gap-1",
                            !isOwn && "pl-10"
                        )}
                    >
                        <span className="text-xs text-muted-foreground">
                            {time}
                        </span>
                        <MessageStatus
                            isOwn={isOwn}
                            viewed={viewed}
                            pending={pending}
                        />
                    </div>
                )}
            </div>
        );
    }

    return (
        <div
            className={cn(
                "flex flex-col gap-0.5",
                isOwn ? "items-end" : "items-start"
            )}
        >
            <div
                className={cn(
                    "flex gap-2 items-end",
                    isOwn ? "flex-row-reverse" : "flex-row"
                )}
            >
                {!isOwn &&
                    (showMeta ? (
                        <Avatar className="size-8 shrink-0">
                            <AvatarImage
                                src={
                                    "author" in msg && msg.author?.image
                                        ? msg.author.image
                                        : undefined
                                }
                            />
                            <AvatarFallback>
                                {"author" in msg
                                    ? (msg.author?.name?.charAt(0) ?? "?")
                                    : "?"}
                            </AvatarFallback>
                        </Avatar>
                    ) : (
                        <div className="size-8 shrink-0" />
                    ))}
                <div
                    className={cn(
                        "flex flex-col gap-1 max-w-[70%]",
                        isOwn && "items-end"
                    )}
                >
                    {imageUrls.length > 0 && (
                        <ImageGrid urls={imageUrls} pending={pending} />
                    )}
                    {("content" in msg ? msg.content : "") && (
                        <div
                            className={cn(
                                "rounded-xl px-4 py-2.5 text-sm wrap-break-words min-w-0",
                                isOwn
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-foreground",
                                pending && "opacity-60"
                            )}
                        >
                            {"content" in msg ? msg.content : ""}
                        </div>
                    )}
                </div>
            </div>
            {showMeta && (
                <div
                    className={cn("flex items-center gap-1", !isOwn && "pl-10")}
                >
                    <span className="text-xs text-muted-foreground">
                        {time}
                    </span>
                    <MessageStatus
                        isOwn={isOwn}
                        viewed={viewed}
                        pending={pending}
                    />
                </div>
            )}
        </div>
    );
}

function TypingIndicator({ name }: { name: string }) {
    return (
        <div className="flex items-center gap-2 px-1 py-1">
            <Avatar className="size-6 shrink-0">
                <AvatarFallback className="text-xs">
                    {name.charAt(0)}
                </AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-1 bg-muted rounded-xl px-3 py-2">
                <span className="text-xs text-muted-foreground">
                    {name} écrit
                </span>
                <span className="flex gap-0.5 ml-1">
                    {[0, 1, 2].map((i) => (
                        <span
                            key={i}
                            className="size-1 rounded-full bg-muted-foreground animate-bounce"
                            style={{ animationDelay: `${i * 150}ms` }}
                        />
                    ))}
                </span>
            </div>
        </div>
    );
}

export default function ConversationView({
    discussionId,
    initialMessages,
    initialHasMore,
    initialNextCursor,
    discussion,
    onSystemAction,
}: ConversationViewProps) {
    const { session } = useSession();
    const userId = session?.user?.id;
    const router = useRouter();
    const searchParams = useSearchParams();

    const [messages, setMessages] = useState<MessageEvent[]>(initialMessages);
    const [pendingMessages, setPendingMessages] = useState<PendingMessage[]>(
        []
    );
    const [hasMore, setHasMore] = useState(initialHasMore);
    const [nextCursor, setNextCursor] = useState<string | undefined>(
        initialNextCursor
    );
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [text, setText] = useState("");
    const [offerPrice, setOfferPrice] = useState("");
    const [offerOpen, setOfferOpen] = useState(false);
    const [typingName, setTypingName] = useState<string | null>(null);
    const [pendingImageFiles, setPendingImageFiles] = useState<File[]>([]);
    const [pendingImagePreviews, setPendingImagePreviews] = useState<string[]>(
        []
    );
    const [isUploadingImages, setIsUploadingImages] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
    const scrollRef = useRef<HTMLDivElement>(null);
    const mountedRef = useRef(false);
    const isNearBottomRef = useRef(true);
    const isFocusedRef = useRef(
        typeof document !== "undefined" ? document.hasFocus() : true
    );
    const isFirstSubscriptionRef = useRef(true);
    const loadMoreRef = useRef<() => void>(() => {});

    // Anchor de scroll : sauvegardé avant un prepend, restauré dans useLayoutEffect
    const scrollAnchorRef = useRef<{
        scrollHeight: number;
        scrollTop: number;
    } | null>(null);

    // Ref pour cleanup des blob URLs au démontage uniquement
    const pendingImagePreviewsRef = useRef<string[]>([]);

    const utils = trpc.useUtils();
    const { startUpload } = useUploadThing("messageImageUploader");

    useEffect(() => {
        pendingImagePreviewsRef.current = pendingImagePreviews;
    }, [pendingImagePreviews]);

    useEffect(() => {
        return () => {
            pendingImagePreviewsRef.current.forEach((url) =>
                URL.revokeObjectURL(url)
            );
        };
    }, []);

    // ─── showMeta ─────────────────────────────────────────────────────────────

    const allMessagesForRender = useMemo(() => {
        const msgCount = messages.length;
        const totalCount = msgCount + pendingMessages.length;

        const getIsOwn = (i: number) =>
            i < msgCount ? messages[i]!.authorID === userId : true;
        const getTime = (i: number) =>
            i < msgCount
                ? new Date(messages[i]!.sendedAt).getTime()
                : new Date(pendingMessages[i - msgCount]!.sendedAt).getTime();
        const getType = (i: number) =>
            i < msgCount
                ? messages[i]!.type
                : pendingMessages[i - msgCount]!.type;

        const computeShowMeta = (i: number): boolean => {
            if (getType(i) === "SYSTEM") return true;
            const next = i + 1;
            if (next >= totalCount || getType(next) === "SYSTEM") return true;
            if (getIsOwn(i) !== getIsOwn(next)) return true;
            return getTime(next) - getTime(i) > 60_000;
        };

        return {
            messages: messages.map((m, i) => ({
                data: m,
                showMeta: computeShowMeta(i),
            })),
            pending: pendingMessages.map((m, i) => ({
                data: m,
                showMeta: computeShowMeta(msgCount + i),
            })),
        };
    }, [messages, pendingMessages, userId]);

    // ─── Scroll helpers ───────────────────────────────────────────────────────

    const scrollToBottom = useCallback(
        (behavior: ScrollBehavior = "smooth") => {
            const el = scrollRef.current;
            if (el) el.scrollTo({ top: el.scrollHeight, behavior });
        },
        []
    );

    // ─── Restauration du scroll après prepend ─────────────────────────────────
    // useLayoutEffect est synchrone : s'exécute après la mise à jour du DOM React
    // mais avant le paint du navigateur. scrollHeight est alors la valeur réelle,
    // pas une estimation — contrairement à requestAnimationFrame.

    useLayoutEffect(() => {
        const el = scrollRef.current;
        if (!el || !scrollAnchorRef.current) return;

        const { scrollHeight: oldScrollHeight, scrollTop: oldScrollTop } =
            scrollAnchorRef.current;
        const addedHeight = el.scrollHeight - oldScrollHeight;
        el.scrollTop = oldScrollTop + addedHeight;
        scrollAnchorRef.current = null;
    }, [messages]);

    // ─── Scroll initial ───────────────────────────────────────────────────────

    useEffect(() => {
        scrollToBottom("instant");
        mountedRef.current = true;
        utils.discussions.getDiscussions.invalidate();
        void utils.discussions.getMessages
            .fetch({ discussionId })
            .then(({ messages: fresh }) => {
                setMessages((prev) => {
                    const existingIds = new Set(prev.map((m) => m.id));
                    const missed = fresh.filter((m) => !existingIds.has(m.id));
                    if (missed.length === 0) return prev;
                    return [...prev, ...missed].sort(
                        (a, b) =>
                            new Date(a.sendedAt).getTime() -
                            new Date(b.sendedAt).getTime()
                    );
                });
            })
            .catch(() => {});
    }, [
        discussionId,
        scrollToBottom,
        utils.discussions.getDiscussions,
        utils.discussions.getMessages,
    ]);

    // Scroll smooth sur nouveaux messages (seulement si déjà en bas)
    useEffect(() => {
        if (!mountedRef.current) return;
        if (isNearBottomRef.current) scrollToBottom("smooth");
    }, [messages.length, pendingMessages.length, scrollToBottom, typingName]);

    // ─── Load more ────────────────────────────────────────────────────────────

    const loadMore = useCallback(async () => {
        if (!hasMore || !nextCursor || isLoadingMore) return;
        const el = scrollRef.current;
        if (!el) return;

        // Sauvegarder avant tout changement de state
        scrollAnchorRef.current = {
            scrollHeight: el.scrollHeight,
            scrollTop: el.scrollTop,
        };

        setIsLoadingMore(true);
        try {
            const result = await utils.discussions.getMessages.fetch({
                discussionId,
                cursor: nextCursor,
            });
            setMessages((prev) => [...result.messages, ...prev]);
            setNextCursor(result.nextCursor);
            setHasMore(result.hasMore);
        } catch {
            scrollAnchorRef.current = null;
        } finally {
            setIsLoadingMore(false);
        }
    }, [hasMore, nextCursor, isLoadingMore, discussionId, utils]);

    useEffect(() => {
        loadMoreRef.current = loadMore;
    }, [loadMore]);

    // Scroll event : near-bottom tracking + trigger load more
    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        const handleScroll = () => {
            isNearBottomRef.current =
                el.scrollHeight - el.scrollTop - el.clientHeight < 150;
            if (el.scrollTop < 150) loadMoreRef.current();
        };
        el.addEventListener("scroll", handleScroll, { passive: true });
        return () => el.removeEventListener("scroll", handleScroll);
    }, [discussionId]);

    // ─── Tracking focus ───────────────────────────────────────────────────────

    useEffect(() => {
        const onFocus = () => {
            isFocusedRef.current = true;
            markAsReadMutation.mutate({ discussionId });
        };
        const onBlur = () => {
            isFocusedRef.current = false;
        };
        const onVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                isFocusedRef.current = true;
                markAsReadMutation.mutate({ discussionId });
            } else {
                isFocusedRef.current = false;
            }
        };
        window.addEventListener("focus", onFocus);
        window.addEventListener("blur", onBlur);
        document.addEventListener("visibilitychange", onVisibilityChange);
        return () => {
            window.removeEventListener("focus", onFocus);
            window.removeEventListener("blur", onBlur);
            document.removeEventListener(
                "visibilitychange",
                onVisibilityChange
            );
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [discussionId]);

    // Ouvrir dialog offre si ?offer=true
    useEffect(() => {
        if (searchParams.get("offer") === "true" && discussion.isBuyer) {
            setOfferOpen(true);
        }
    }, [searchParams, discussion.isBuyer]);

    // ─── Subscriptions WebSocket ──────────────────────────────────────────────

    trpc.discussions.onMessage.useSubscription(
        { discussionId },
        {
            onStarted: () => {
                if (isFirstSubscriptionRef.current) {
                    isFirstSubscriptionRef.current = false;
                    return;
                }
                void utils.discussions.getMessages
                    .fetch({ discussionId })
                    .then(({ messages: serverMessages }) => {
                        setMessages((prev) => {
                            const existingIds = new Set(prev.map((m) => m.id));
                            const missed = serverMessages.filter(
                                (m) => !existingIds.has(m.id)
                            );
                            if (missed.length === 0) return prev;
                            return [...prev, ...missed].sort(
                                (a, b) =>
                                    new Date(a.sendedAt).getTime() -
                                    new Date(b.sendedAt).getTime()
                            );
                        });
                        if (isFocusedRef.current) {
                            markAsReadMutation.mutate({ discussionId });
                        }
                        utils.discussions.getDiscussions.invalidate();
                    });
            },
            onData: (msg) => {
                setMessages((prev) => {
                    if (prev.some((m) => m.id === msg.id)) return prev;
                    return [...prev, msg];
                });
                if (msg.authorID === userId) {
                    setPendingMessages((prev) => {
                        const idx = prev.findIndex(
                            (p) =>
                                p.type === msg.type &&
                                p.content === msg.content &&
                                p.price === msg.price
                        );
                        return idx >= 0
                            ? prev.filter((_, i) => i !== idx)
                            : prev;
                    });
                } else if (isFocusedRef.current) {
                    markAsReadMutation.mutate({ discussionId });
                }
                utils.discussions.getDiscussions.invalidate();
            },
        }
    );

    trpc.discussions.onTyping.useSubscription(
        { discussionId },
        {
            onData: ({ name }) => {
                setTypingName(name);
                clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = setTimeout(
                    () => setTypingName(null),
                    3000
                );
            },
        }
    );

    trpc.discussions.onReadReceipt.useSubscription(
        { discussionId },
        {
            onData: () => {
                setMessages((prev) =>
                    prev.map((m) =>
                        m.authorID === userId ? { ...m, viewed: true } : m
                    )
                );
                utils.discussions.getDiscussions.invalidate();
            },
        }
    );

    // ─── Mutations ────────────────────────────────────────────────────────────

    const sendMessageMutation = trpc.discussions.sendMessage.useMutation();
    const sendOfferMutation = trpc.discussions.sendMessage.useMutation();
    const sendTypingMutation = trpc.discussions.sendTyping.useMutation();
    const markAsReadMutation = trpc.discussions.markAsRead.useMutation();

    const debouncedSendTyping = useDebouncedCallback(
        () => sendTypingMutation.mutate({ discussionId }),
        2000,
        { leading: true, trailing: false }
    );

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setText(e.target.value);
        if (e.target.value.trim()) debouncedSendTyping();
    };

    const addImages = useCallback(
        (files: File[]) => {
            const imageFiles = files.filter((f) => f.type.startsWith("image/"));
            if (imageFiles.length === 0) return;
            const remaining = 8 - pendingImageFiles.length;
            if (remaining <= 0) {
                toast.error("Limite atteinte", {
                    description: "Maximum 8 images par message.",
                });
                return;
            }
            const toAdd = imageFiles.slice(0, remaining);
            if (imageFiles.length > remaining) {
                toast.warning(
                    `${imageFiles.length - remaining} image${imageFiles.length - remaining > 1 ? "s" : ""} ignorée${imageFiles.length - remaining > 1 ? "s" : ""}`,
                    {
                        description: "Maximum 8 images par message.",
                    }
                );
            }
            const newPreviews = toAdd.map((f) => URL.createObjectURL(f));
            setPendingImageFiles((prev) => [...prev, ...toAdd]);
            setPendingImagePreviews((prev) => [...prev, ...newPreviews]);
        },
        [pendingImageFiles.length]
    );

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        addImages(Array.from(e.target.files ?? []));
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        const files = Array.from(e.clipboardData.items)
            .filter(
                (item) => item.kind === "file" && item.type.startsWith("image/")
            )
            .map((item) => item.getAsFile())
            .filter((f): f is File => f !== null);
        if (files.length > 0) {
            e.preventDefault();
            addImages(files);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        if (Array.from(e.dataTransfer.types).includes("Files")) {
            e.preventDefault();
            setIsDragging(true);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setIsDragging(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        addImages(Array.from(e.dataTransfer.files));
    };

    const handleRemoveImage = (index: number) => {
        URL.revokeObjectURL(pendingImagePreviews[index]!);
        setPendingImageFiles((prev) => prev.filter((_, i) => i !== index));
        setPendingImagePreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSend = async () => {
        const content = text.trim();
        const hasImages = pendingImageFiles.length > 0;
        if (!content && !hasImages) return;
        if (pendingImageFiles.length > 8) {
            toast.error("Trop d'images", {
                description: "Maximum 8 images par message.",
            });
            return;
        }

        const tempId =
            globalThis.crypto?.randomUUID?.() ??
            `${Date.now()}-${Math.random().toString(36).slice(2)}`;

        const blobUrls = [...pendingImagePreviews];
        setText("");
        setPendingImageFiles([]);
        setPendingImagePreviews([]);
        setPendingMessages((prev) => [
            ...prev,
            {
                tempId,
                content: content || null,
                price: null,
                imageUrls: blobUrls,
                type: "TEXT",
                sendedAt: new Date().toISOString(),
            },
        ]);

        try {
            let uploadedUrls: string[] = [];

            if (hasImages) {
                setIsUploadingImages(true);
                try {
                    const uploaded = await startUpload(pendingImageFiles);
                    uploadedUrls = (uploaded ?? []).map((f) => f.ufsUrl);
                    if (uploadedUrls.length === 0)
                        throw new Error("Upload failed");
                } finally {
                    setIsUploadingImages(false);
                }
            }

            const newMsg = await sendMessageMutation.mutateAsync({
                discussionId,
                content: content || undefined,
                type: "TEXT",
                imageUrls: uploadedUrls,
            });
            setMessages((prev) =>
                prev.some((m) => m.id === newMsg.id) ? prev : [...prev, newMsg]
            );
            setPendingMessages((prev) =>
                prev.filter((p) => p.tempId !== tempId)
            );
            blobUrls.forEach((url) => URL.revokeObjectURL(url));
            utils.discussions.getDiscussions.invalidate();
        } catch {
            toast.error("Erreur lors de l'envoi");
            setPendingMessages((prev) =>
                prev.filter((p) => p.tempId !== tempId)
            );
            setText(content);
        }
    };

    const handleSendOffer = async () => {
        const price = parseInt(offerPrice, 10);
        if (isNaN(price) || price < 1) return;
        const tempId =
            globalThis.crypto?.randomUUID?.() ??
            `${Date.now()}-${Math.random().toString(36).slice(2)}`;

        setOfferOpen(false);
        setOfferPrice("");
        setPendingMessages((prev) => [
            ...prev,
            {
                tempId,
                content: null,
                price,
                imageUrls: [],
                type: "OFFER",
                sendedAt: new Date().toISOString(),
            },
        ]);

        try {
            const newMsg = await sendOfferMutation.mutateAsync({
                discussionId,
                price,
                type: "OFFER",
            });
            setMessages((prev) =>
                prev.some((m) => m.id === newMsg.id) ? prev : [...prev, newMsg]
            );
            setPendingMessages((prev) =>
                prev.filter((p) => p.tempId !== tempId)
            );
            utils.discussions.getDiscussions.invalidate();
        } catch {
            toast.error("Erreur lors de l'envoi de l'offre");
            setPendingMessages((prev) =>
                prev.filter((p) => p.tempId !== tempId)
            );
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            void handleSend();
        }
    };

    const thumbnail = discussion.post.images[0] ?? null;
    const canSend = text.trim().length > 0 || pendingImageFiles.length > 0;

    return (
        <div
            className="flex flex-col flex-1 overflow-hidden relative"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {isDragging && (
                <div className="absolute inset-2 z-50 flex items-center justify-center bg-background/80 border-2 border-dashed border-primary rounded-lg pointer-events-none">
                    <div className="flex flex-col items-center gap-2 text-primary">
                        <ImageIcon className="size-10" />
                        <p className="text-sm font-medium">
                            Déposer les images ici
                        </p>
                    </div>
                </div>
            )}
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b bg-background shrink-0">
                <Button
                    variant="ghost"
                    size="icon-sm"
                    className="md:hidden shrink-0"
                    onClick={() => router.push("/messages")}
                >
                    <ArrowLeft className="size-4" />
                </Button>

                <Link
                    href={`/post/${discussion.post.id}`}
                    className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity"
                >
                    <div className="relative size-14 shrink-0 rounded-lg overflow-hidden bg-muted">
                        {thumbnail && (
                            <Image
                                src={thumbnail}
                                alt={discussion.post.title}
                                fill
                                className="object-cover"
                            />
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="font-semibold text-base line-clamp-1">
                            {discussion.post.title}
                        </p>
                        <p className="text-lg font-bold text-primary">
                            {discussion.post.price} €
                        </p>
                    </div>
                </Link>

                <Link
                    href={
                        discussion.otherParty.username
                            ? `/profile/${discussion.otherParty.username}`
                            : "#"
                    }
                    className="flex items-center gap-2 shrink-0 hover:opacity-80 transition-opacity"
                >
                    <Avatar className="size-8">
                        <AvatarImage
                            src={discussion.otherParty.image ?? undefined}
                        />
                        <AvatarFallback>
                            {discussion.otherParty.username?.charAt(0) ?? "?"}
                        </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium hidden sm:block">
                        {discussion.otherParty.username ??
                            "Utilisateur inconnu"}
                    </span>
                </Link>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto">
                {/* Skeletons en haut, dans le flux normal — sans impact sur les index */}
                {isLoadingMore && (
                    <div className="px-4 py-2 space-y-3">
                        {[0, 1, 2, 3, 4].map((i) => (
                            <div key={`sk-${i}`} className="py-1.5">
                                <MessageSkeleton isOwn={i % 2 === 0} />
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex flex-col">
                    {allMessagesForRender.messages.map(
                        ({ data: m, showMeta }) => (
                            <div
                                key={m.id}
                                className={cn(
                                    "px-4",
                                    showMeta ? "py-1.5" : "py-0.5"
                                )}
                            >
                                <MessageBubble
                                    msg={m}
                                    isOwn={m.authorID === userId}
                                    showMeta={showMeta}
                                    onSystemAction={onSystemAction}
                                    discussionId={discussionId}
                                />
                            </div>
                        )
                    )}

                    {allMessagesForRender.pending.map(
                        ({ data: m, showMeta }) => (
                            <div
                                key={m.tempId}
                                className={cn(
                                    "px-4",
                                    showMeta ? "py-1.5" : "py-0.5"
                                )}
                            >
                                <MessageBubble
                                    msg={m}
                                    isOwn={true}
                                    pending={true}
                                    showMeta={showMeta}
                                    onSystemAction={onSystemAction}
                                    discussionId={discussionId}
                                />
                            </div>
                        )
                    )}

                    {typingName && (
                        <div className="px-4 py-1.5">
                            <TypingIndicator name={typingName} />
                        </div>
                    )}
                </div>
            </div>

            {/* Prévisualisation des images sélectionnées */}
            {pendingImagePreviews.length > 0 && (
                <div className="flex gap-2 px-3 pt-2 bg-background border-t flex-wrap">
                    {pendingImagePreviews.map((url, i) => (
                        <div
                            key={i}
                            className="relative size-16 rounded-lg overflow-hidden bg-muted shrink-0"
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={url}
                                alt=""
                                className="w-full h-full object-cover"
                            />
                            <button
                                onClick={() => handleRemoveImage(i)}
                                className="absolute top-0.5 right-0.5 size-4 rounded-full bg-background/80 flex items-center justify-center hover:bg-background"
                            >
                                <X className="size-2.5" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Barre d'input */}
            <div className="flex items-center gap-2 p-3 border-t bg-background shrink-0">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageSelect}
                />

                <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-muted-foreground"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={
                        pendingImageFiles.length >= 8 || isUploadingImages
                    }
                    title="Envoyer des images"
                >
                    <ImageIcon className="size-5" />
                </Button>

                {discussion.isBuyer && (
                    <>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="shrink-0 text-muted-foreground"
                            onClick={() => setOfferOpen(true)}
                            title="Faire une offre"
                        >
                            <CircleDollarSign className="size-5" />
                        </Button>

                        <Dialog open={offerOpen} onOpenChange={setOfferOpen}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Faire une offre</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-3">
                                    <p className="text-sm text-muted-foreground">
                                        Prix demandé :{" "}
                                        <span className="font-semibold text-foreground">
                                            {discussion.post.price} €
                                        </span>
                                    </p>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            placeholder="Votre offre"
                                            value={offerPrice}
                                            onChange={(e) =>
                                                setOfferPrice(e.target.value)
                                            }
                                            min={1}
                                            max={32767}
                                            className="pr-8"
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter")
                                                    void handleSendOffer();
                                            }}
                                            autoFocus
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                                            €
                                        </span>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button
                                        onClick={() => void handleSendOffer()}
                                        loading={sendOfferMutation.isPending}
                                        disabled={
                                            !offerPrice ||
                                            parseInt(offerPrice) < 1
                                        }
                                    >
                                        <Tag className="size-4 mr-2" />
                                        Envoyer l&apos;offre
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </>
                )}

                <Input
                    className="flex-1"
                    placeholder="Entrer votre message"
                    value={text}
                    onChange={handleTextChange}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                />
                <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => void handleSend()}
                    disabled={!canSend}
                    className="shrink-0"
                >
                    <Send className="size-4" />
                </Button>
            </div>
        </div>
    );
}
