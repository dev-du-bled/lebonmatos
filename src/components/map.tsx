"use client";

import { MapContainer, TileLayer, Polygon } from "react-leaflet";
// @ts-expect-error leaflet's types are broken
import "leaflet/dist/leaflet.css";
import { formatCoordinates } from "@/utils/location";

interface MapProps {
    latitude: number;
    longitude: number;
    coordinates?: number[];
}

export default function Map({ latitude, longitude, coordinates }: MapProps) {
    const polygonPoints = formatCoordinates(coordinates || []);

    return (
        <MapContainer
            center={[latitude, longitude]}
            zoom={10.5}
            scrollWheelZoom={true}
            style={{
                height: "400px",
                width: "100%",
                borderRadius: "var(--radius)",
            }}
        >
            <TileLayer
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={14}
                minZoom={2}
            />
            {polygonPoints.length > 0 && (
                <Polygon
                    positions={polygonPoints}
                    color="orange"
                    fillOpacity={0.3}
                />
            )}
        </MapContainer>
    );
}
