import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Star } from "lucide-react";
import { trpc } from "@/trpc/server";

interface UserPreviewProps {
    user: {
        id: string;
        username: string | null;
        displayUsername: string | null;
        image: string | null;
    };
}

export default async function UserPreview({ user }: UserPreviewProps) {
    const profile = await trpc.user.getPublicProfile({ userId: user.id });
    const displayName = user.displayUsername ?? user.username ?? "Utilisateur supprimé";

    return (
        <div className="flex flex-row items-center gap-2">
            <Avatar>
                <AvatarImage src={user.image || undefined} />
                <AvatarFallback>{displayName.slice(0, 2)}</AvatarFallback>
            </Avatar>

            <div className="flex font-sans flex-col">
                <span className="text-sm">
                    {displayName}
                </span>
                <span className="flex flex-row items-center gap-1 text-xs font-sans">
                    {profile?.rating.average?.toFixed(1) ?? "-"}
                    <Star size={12} className="fill-primary stroke-0" />
                    {`(${profile?.rating.count ?? 0})`}
                </span>
            </div>
        </div>
    );
}
