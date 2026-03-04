import React, { Suspense } from "react";
import {
    AlertTriangle,
    Star,
    FileText,
    User,
    MessageSquare,
    Clock,
    CheckCircle,
    XCircle,
    ExternalLink,
} from "lucide-react";
import { trpc } from "@/trpc/server";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import NavBack from "@/components/nav/nav-back";
import Link from "next/link";
import type { Metadata } from "next";
import type {
    REPORT_TYPE,
    REPORT_CONTENT,
    REPORT_STATUS,
} from "@prisma/client";
import {
    reasonLabel,
    typeLabel,
    statusLabel,
    statusVariant,
} from "@/lib/report";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
    title: "Mes signalements",
    description: "Suivre l'état de mes signalements",
};

type MyReport = {
    id: string;
    reason: REPORT_TYPE;
    reasonLabel: string;
    details: string | null;
    type: REPORT_CONTENT;
    status: REPORT_STATUS;
    contentSnapshot: string | null;
    reportedAt: Date | string;
    post: { id: string; title: string | null } | null;
    rating: {
        id: string;
        rating: number;
        comment: string | null;
        user: { id: string; displayUsername: string | null } | null;
    } | null;
    reportedUser: { id: string; displayUsername: string | null } | null;
};

function ReportCardSkeleton() {
    return (
        <div className="flex overflow-hidden rounded-xl border bg-card shadow-sm">
            <div className="flex flex-1 flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex gap-2">
                        <Skeleton className="h-5 w-20 rounded-full" />
                        <Skeleton className="h-5 w-16 rounded-full" />
                        <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-24 shrink-0" />
                </div>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </div>
        </div>
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

const typeIcon: Record<REPORT_CONTENT, React.ReactNode> = {
    POST: <FileText className="size-4" />,
    USER: <User className="size-4" />,
    REVIEW: <MessageSquare className="size-4" />,
};

const statusIcon: Record<REPORT_STATUS, React.ReactNode> = {
    PENDING: <Clock className="size-3.5" />,
    RESOLVED: <CheckCircle className="size-3.5" />,
    REJECTED: <XCircle className="size-3.5" />,
};

function ReportCard({ report }: { report: MyReport }) {
    const date = new Date(report.reportedAt).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });

    return (
        <div className="flex overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md">
            <div className="flex flex-1 flex-col gap-3 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                            {typeIcon[report.type]}
                            {typeLabel[report.type]}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                            {reasonLabel[report.reason]}
                        </Badge>
                        <Badge
                            variant={statusVariant[report.status]}
                            className="inline-flex items-center gap-1 text-xs"
                        >
                            {statusIcon[report.status]}
                            {statusLabel[report.status]}
                        </Badge>
                    </div>
                    <time
                        className="text-xs text-muted-foreground shrink-0"
                        dateTime={new Date(report.reportedAt).toISOString()}
                    >
                        {date}
                    </time>
                </div>

                <Separator />

                <div className="flex flex-col gap-1.5">
                    {report.type === "POST" && (
                        <div className="flex items-start gap-2 text-sm">
                            <span className="shrink-0">Annonce :</span>
                            {report.post ? (
                                <Link
                                    href={`/post/${report.post.id}`}
                                    className="inline-flex items-center gap-1 font-medium hover:underline"
                                >
                                    {report.post.title ?? report.post.id}
                                    <ExternalLink className="size-3 opacity-60" />
                                </Link>
                            ) : (
                                <span className="font-medium text-muted-foreground italic">
                                    {report.contentSnapshot ??
                                        "Contenu supprimé"}
                                    {report.status === "RESOLVED" && (
                                        <span className="ml-1 not-italic text-xs">
                                            (supprimée suite au traitement)
                                        </span>
                                    )}
                                </span>
                            )}
                        </div>
                    )}

                    {report.type === "REVIEW" && (
                        <div className="flex flex-col gap-1 text-sm">
                            {report.rating ? (
                                <>
                                    <div className="flex items-center gap-1.5">
                                        <span className="shrink-0">Avis :</span>
                                        <span className="inline-flex items-center gap-1 font-medium">
                                            <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
                                            {report.rating.rating}/5
                                        </span>
                                        {report.rating.user && (
                                            <span className="text-muted-foreground text-xs">
                                                —{" "}
                                                {report.rating.user
                                                    .displayUsername ??
                                                    "Utilisateur supprimé"}
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
                                </>
                            ) : (
                                <div className="flex items-start gap-2">
                                    <span className="shrink-0">Avis :</span>
                                    <span className="font-medium text-muted-foreground italic">
                                        {report.contentSnapshot ??
                                            "Contenu supprimé"}
                                        {report.status === "RESOLVED" && (
                                            <span className="ml-1 not-italic text-xs">
                                                (supprimé suite au traitement)
                                            </span>
                                        )}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {report.type === "USER" && report.reportedUser && (
                        <div className="flex items-center gap-2 text-sm">
                            <span className="shrink-0">Utilisateur :</span>
                            <span className="font-medium">
                                {report.reportedUser.displayUsername ?? "—"}
                            </span>
                        </div>
                    )}
                </div>

                {/* Détails fournis */}
                <p
                    className="text-xs text-muted-foreground break-all"
                    title={report.details ?? undefined}
                >
                    <span className="font-medium text-foreground">
                        Détails :{" "}
                    </span>
                    {report.details ?? (
                        <span className="italic">Aucun détail fourni</span>
                    )}
                </p>
            </div>
        </div>
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
