"use client";

import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader } from "../ui/card";
import { CityData } from "@/utils/location";
import { Skeleton } from "../ui/skeleton";
const MapComponent = dynamic(() => import("@/components/map"), {
    ssr: false,
    loading: () => <Skeleton className="h-112 w-full rounded-md" />,
});

interface MapProps {
    location: CityData;
}

export default function PostMap({ location }: MapProps) {
    return (
        <Card>
            <CardHeader>
                <h2 className="text-xl font-semibold">Location</h2>
                <span className="text-sm text-muted-foreground">
                    {location.name} - {location.state}, {location.country}
                </span>
            </CardHeader>
            <CardContent>
                <MapComponent
                    latitude={location.lat}
                    longitude={location.lon}
                    coordinates={location.coordinates}
                />
            </CardContent>
        </Card>
    );
}
