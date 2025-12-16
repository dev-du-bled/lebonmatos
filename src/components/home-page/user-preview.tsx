import { User } from "@prisma/client";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Star } from "lucide-react";

interface UserPreviewProps {
    user: User;
}

export default function UserPreview({ user }: UserPreviewProps) {
    return (
        <div className="flex flex-row items-center gap-2">
            <Avatar>
                <AvatarImage src={user.image || undefined} />
                <AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
            </Avatar>

            <div className="flex font-sans flex-col">
                <span className="text-sm">
                    {user?.name ?? "Utilisateur supprimé"}
                </span>
                {/*[TODO] Fetch ratings here*/}
                <span className="flex flex-row items-center gap-1 text-xs font-sans">
                    {"4.5"}
                    <Star size={12} className="fill-primary stroke-0" />
                    {"(5)"}
                </span>
            </div>
        </div>
    );
}
