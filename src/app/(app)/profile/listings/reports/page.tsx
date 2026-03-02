import { Suspense } from "react";
import { AlertTriangle, Star } from "lucide-react";
import { trpc } from "@/trpc/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import NavBack from "@/components/nav/nav-back";
import Link from "next/link";
import type { Metadata } from "next";
import type { REPORT_TYPE, REPORT_CONTENT } from "@prisma/client";

export const metadata: Metadata = {
    title: "Mes signalements",
    description: "Suivre l'état de mes signalements",
};

const reasonLabel: Record<REPORT_TYPE, string> = {
    SPAM: "Spam",
    INNAPPROPRIATE: "Inapproprié",
    HARASSMENT: "Harcèlement",
    SCAM: "Arnaque",
    OTHER: "Autre",
};

const reasonVariant: Record<
    REPORT_TYPE,
    "destructive" | "secondary" | "outline"
> = {
    SPAM: "secondary",
    INNAPPROPRIATE: "destructive",
    HARASSMENT: "destructive",
    SCAM: "destructive",
    OTHER: "outline",
};

const typeLabel: Record<REPORT_CONTENT, string> = {
    POST: "Annonce",
    REVIEW: "Avis",
    USER: "Utilisateur",
};

type MyReport = {
    id: string;
    reason: REPORT_TYPE;
    reasonLabel: string;
    details: string | null;
    type: REPORT_CONTENT;
    reportedAt: Date | string;
    post: { id: string; title: string | null } | null;
    rating: {
        id: string;
        rating: number;
        comment: string | null;
        user: { id: string; name: string | null } | null;
    } | null;
    reportedUser: { id: string; name: string | null } | null;
};

function ReportCardSkeleton() {
    return (
        <Card>
            <CardContent className="flex flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex gap-2">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-5 w-16" />
                    </div>
                    <Skeleton className="h-4 w-24 shrink-0" />
                </div>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </CardContent>
        </Card>
    );
}

function ReportsSkeleton() {
    return (
        <div className="grid gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <ReportCardSkeleton key={i} />
            ))}
        </div>
    );
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center gap-6 py-16 text-center">
            <div className="flex size-20 items-center justify-center rounded-full bg-secondary">
                <AlertTriangle className="size-10 text-muted-foreground" />
            </div>
            <div className="space-y-2">
                <h2 className="text-xl font-semibold">Aucun signalement</h2>
                <p className="max-w-sm text-muted-foreground">
                    Vous n&apos;avez pas encore effectué de signalement.
                </p>
            </div>
        </div>
    );
}

function ReportCard({ report }: { report: MyReport }) {
    const date = new Date(report.reportedAt).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });

    return (
        <Card>
            <CardContent className="flex flex-col gap-3 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">
                            {typeLabel[report.type]}
                        </Badge>
                        <Badge variant={reasonVariant[report.reason]}>
                            {reasonLabel[report.reason]}
                        </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                        {date}
                    </span>
                </div>

                {/* Cible du signalement */}
                {report.type === "POST" && report.post && (
                    <div className="text-sm">
                        <span className="text-muted-foreground">
                            Annonce :{" "}
                        </span>
                        <Link
                            href={`/post/${report.post.id}`}
                            className="font-medium hover:underline"
                        >
                            {report.post.title ?? report.post.id}
                        </Link>
                    </div>
                )}

                {report.type === "REVIEW" && report.rating && (
                    <div className="flex flex-col gap-0.5 text-sm">
                        <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">
                                Avis :{" "}
                            </span>
                            <Star className="h-3.5 w-3.5 fill-current text-yellow-500" />
                            <span className="font-medium">
                                {report.rating.rating}/5
                            </span>
                            {report.rating.user && (
                                <span className="text-muted-foreground">
                                    — {report.rating.user.name}
                                </span>
                            )}
                        </div>
                        {report.rating.comment && (
                            <p
                                className="max-w-md truncate text-xs text-muted-foreground"
                                title={report.rating.comment}
                            >
                                {report.rating.comment}
                            </p>
                        )}
                    </div>
                )}

                {report.type === "USER" && report.reportedUser && (
                    <div className="text-sm">
                        <span className="text-muted-foreground">
                            Utilisateur :{" "}
                        </span>
                        <span className="font-medium">
                            {report.reportedUser.name ?? "—"}
                        </span>
                    </div>
                )}

                {/* Détails fournis */}
                {report.details && (
                    <p
                        className="text-sm text-muted-foreground line-clamp-2"
                        title={report.details}
                    >
                        <span className="font-medium text-foreground">
                            Détails :{" "}
                        </span>
                        {report.details}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

async function ReportsContent() {
    const { reports } = await trpc.reports.getMyReports({
        limit: 50,
        offset: 0,
    });

    if (reports.length === 0) {
        return <EmptyState />;
    }

    return (
        <div className="grid gap-4">
            {reports.map((report) => (
                <ReportCard key={report.id} report={report as MyReport} />
            ))}
        </div>
    );
}

export default function ProfileReportsPage() {
    return (
        <section className="mx-auto w-full max-w-4xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
            <NavBack
                href="/profile"
                title="Mes signalements"
                desc="Suivez l'état de vos signalements"
            />

            <Suspense fallback={<ReportsSkeleton />}>
                <ReportsContent />
            </Suspense>
        </section>
    );
}
