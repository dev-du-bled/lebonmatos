"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PublicProfileDialog } from "@/components/profile/public-profile-dialog";
import { trpc } from "@/trpc/client";
import { Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function ProfileHeader() {
    const { data: user, isLoading } = trpc.user.getProfile.useQuery();

    if (isLoading) {
        return (
            <div className="flex flex-col items-center gap-6 text-center md:flex-row md:items-center md:justify-between md:text-left">
                <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
                    <Skeleton className="size-22 rounded-full" />
                    <div className="space-y-4">
                        <Skeleton className="h-9 w-48" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>
                <Skeleton className="h-10 w-40" />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const displayName = user.username ?? user.name ?? "Mon profil";
    const initials = displayName
        .split(/\s+/)
        .map((segment: string) => segment[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase();

    const ratingValue = user.rating.average ?? 0;
    const ratingCount = user.rating.count;

    return (
        <div className="flex flex-col items-center gap-6 text-center md:flex-row md:items-center md:justify-between md:text-left">
            <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
                <Avatar
                    key={user.image}
                    className="size-24 border-4 border-background text-3xl font-semibold shadow-lg"
                >
                    {user.image && (
                        <AvatarImage
                            src={user.image}
                            alt={`Avatar de ${displayName}`}
                            className="object-cover"
                        />
                    )}
                    <AvatarFallback className="bg-secondary text-muted-foreground">
                        {initials}
                    </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold sm:text-3xl">
                            {displayName}
                        </h1>
                        {user.username && user.username !== displayName && (
                            <p className="text-sm text-muted-foreground">
                                @{user.username}
                            </p>
                        )}
                    </div>

                    {user.bio && (
                        <p className="max-w-md text-sm text-muted-foreground">
                            {user.bio}
                        </p>
                    )}

                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground md:justify-start">
                        <span className="flex items-center gap-1 font-medium text-foreground">
                            {ratingValue > 0 ? ratingValue.toFixed(1) : "-"}
                            <Star
                                className="size-4 text-primary"
                                fill="currentColor"
                            />
                        </span>
                        <span>({ratingCount} avis)</span>
                    </div>
                </div>
            </div>

            <PublicProfileDialog user={user} />
        </div>
    );
}
