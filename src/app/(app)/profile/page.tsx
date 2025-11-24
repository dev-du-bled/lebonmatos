import Link from "next/link";
import { getUser } from "@/app/utils/getUser";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Cpu,
  FileText,
  Heart,
  MessageSquare,
  Settings,
  ShoppingBag,
  Star,
  User,
} from "lucide-react";

type QuickAction = {
  title: string;
  description: string;
  href: string;
  Icon: LucideIcon;
};

const QUICK_ACTIONS: QuickAction[] = [
  {
    title: "Éditer mon profil",
    description: "Changer l'aspect de mon profil",
    href: "/profile/edit",
    Icon: User,
  },
  {
    title: "Mes annonces",
    description: "Voir mes annonces en ligne et expirées",
    href: "/profile/listings",
    Icon: FileText,
  },
  {
    title: "Mes achats",
    description: "Voir mes achats effectués",
    href: "/profile/purchases",
    Icon: ShoppingBag,
  },
  {
    title: "Mes configurations",
    description: "Voir mes configurations enregistrées",
    href: "/profile/configurations",
    Icon: Cpu,
  },
  {
    title: "Mes signalements",
    description: "Suivre l'état de mes signalements",
    href: "/profile/reports",
    Icon: AlertTriangle,
  },
  {
    title: "Favoris",
    description: "Voir mes annonces favorites",
    href: "/profile/favorites",
    Icon: Heart,
  },
  {
    title: "Avis",
    description: "Comment les utilisateurs ont perçu mes interactions",
    href: "/profile/reviews",
    Icon: MessageSquare,
  },
  {
    title: "Paramètres",
    description: "Modifier les notifications, la vie privée, etc.",
    href: "/profile/settings",
    Icon: Settings,
  },
];

export default async function ProfilePage() {
  const user = await getUser();

  const displayName = user?.username ?? user?.name ?? "Mon profil";
  const initials = displayName
    .split(/\s+/)
    .map((segment) => segment[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const ratingValue = 4.5;
  const ratingCount = 5;

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center gap-6 text-center md:flex-row md:items-center md:justify-between md:text-left">
        <div className="flex flex-col items-center gap-4 md:flex-row md:items-center">
          <Avatar className="size-24 border-4 border-background text-3xl font-semibold shadow-lg">
            {user?.image ? (
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
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold sm:text-3xl">
              {displayName}
            </h1>
            {user?.username && user.username !== displayName && (
              <p className="text-sm text-muted-foreground">@{user.username}</p>
            )}
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground md:justify-start">
              <span className="flex items-center gap-1 font-medium text-foreground">
                {ratingValue.toFixed(1)}
                <Star className="size-4 text-primary" fill="currentColor" />
              </span>
              <span>({ratingCount})</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {QUICK_ACTIONS.map(({ title, description, href, Icon }) => (
          <Link key={title} href={href} className="group" prefetch={false}>
            <Card className="h-full gap-3 border-transparent bg-secondary/40 p-5 transition hover:border-primary hover:bg-background hover:shadow-md">
              <CardContent className="flex h-full flex-col gap-4 p-0">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-lg bg-primary/20 text-black/85 transition group-hover:bg-primary group-hover:text-black">
                    <Icon className="size-5" />
                  </span>
                  <CardTitle className="text-base font-semibold">
                    {title}
                  </CardTitle>
                </div>
                <CardDescription className="text-sm text-muted-foreground">
                  {description}
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
