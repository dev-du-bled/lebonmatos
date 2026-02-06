"use client";

import dynamic from "next/dynamic";

interface MapProps {
    latitude: number;
    longitude: number;
}

export default function Map({ latitude, longitude }: MapProps) {
    const Map = dynamic(() => import("@/components/map"), { ssr: false });

    return <Map latitude={latitude} longitude={longitude} />;
}
