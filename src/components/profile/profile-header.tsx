import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Medal } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReviewsDialog } from "@/app/(app)/user/[username]/reviews-dialog";
import type { Review } from "@/app/(app)/user/[username]/reviews-dialog";

type MemberTier = {
    color: string;
    bg: string;
    label: string;
};

function getMemberSince(createdAt: Date): { label: string; tier: MemberTier } {
    const now = new Date();
    const diffMs = now.getTime() - createdAt.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    const label =
        diffYears >= 1
            ? `${diffYears} an${diffYears > 1 ? "s" : ""}`
            : diffMonths >= 1
              ? `${diffMonths} mois`
              : `${diffDays} jour${diffDays > 1 ? "s" : ""}`;

    const tier: MemberTier =
        diffYears >= 5
            ? {
                  color: "text-sky-400",
                  bg: "bg-sky-400/10 border-sky-400/30",
                  label: "Diamant",
              }
            : diffYears >= 2
              ? {
                    color: "text-yellow-400",
                    bg: "bg-yellow-400/10 border-yellow-400/30",
                    label: "Or",
                }
              : diffMonths >= 6
                ? {
                      color: "text-slate-400",
                      bg: "bg-slate-400/10 border-slate-400/30",
                      label: "Argent",
                  }
                : {
                      color: "text-amber-700",
                      bg: "bg-amber-700/10 border-amber-700/30",
                      label: "Bronze",
                  };

    return { label, tier };
}

export type ProfileHeaderUser = {
    id: string;
    username: string | null;
    displayUsername: string | null;
    bio: string | null;
    image: string | null;
    createdAt: string;
};

type ProfileHeaderProps = {
    user: ProfileHeaderUser;
    reviewStats: { average: number; count: number };
    initialReviews: Review[];
    initialNextCursor: string | undefined;
    action: React.ReactNode;
};

export function ProfileHeader({
    user,
    reviewStats,
    initialReviews,
    initialNextCursor,
    action,
}: ProfileHeaderProps) {
    const displayName = user.username ?? "Utilisateur";

    const initials = displayName
        .split(/\s+/)
        .map((segment: string) => segment[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase();

    const { label: memberLabel, tier } = getMemberSince(
        new Date(user.createdAt)
    );

    return (
        <div className="flex flex-col items-center gap-6 text-center md:flex-row md:items-center md:justify-between md:text-left">
            <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
                <Avatar className="size-24 border-4 border-background text-3xl font-semibold shadow-lg">
                    {user.image ? (
                        <AvatarImage
                            src={user.image}
                            alt={`Avatar de ${displayName}`}
                            className="object-cover"
                        />
                    ) : null}
                    <AvatarFallback className="bg-secondary text-muted-foreground">
                        {initials}
                    </AvatarFallback>
                </Avatar>

                <div className="space-y-2">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold sm:text-3xl">
                            {displayName}
                        </h1>
                    </div>

                    {user.bio && (
                        <p className="max-w-md text-sm text-muted-foreground">
                            {user.bio}
                        </p>
                    )}

                    <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
                        <ReviewsDialog
                            userId={user.id}
                            initialReviews={initialReviews}
                            initialNextCursor={initialNextCursor}
                            average={reviewStats.average}
                            count={reviewStats.count}
                            username={displayName}
                        />
                        <span className="text-muted-foreground/40 hidden sm:inline select-none">
                            ·
                        </span>
                        <span
                            title={`Membre ${tier.label} — inscrit depuis ${memberLabel}`}
                            className={cn(
                                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
                                tier.bg
                            )}
                        >
                            <Medal className={cn("size-3.5", tier.color)} />
                            <span className={tier.color}>
                                Membre depuis {memberLabel}
                            </span>
                        </span>
                    </div>
                </div>
            </div>

            <div className="shrink-0">{action}</div>
        </div>
    );
}
