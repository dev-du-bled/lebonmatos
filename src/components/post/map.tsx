"use client";

import { MapContainer, TileLayer, Polygon, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { formatCoordinates } from "@/utils/location";
import L from "leaflet";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Minus, LocateFixed } from "lucide-react";
import { createRoot } from "react-dom/client";

interface MapProps {
    latitude: number;
    longitude: number;
    coordinates?: number[];
}

function ResetPositionControl({
    latitude,
    longitude,
}: {
    latitude: number;
    longitude: number;
}) {
    const map = useMap();

    useEffect(() => {
        const resetControl = L.Control.extend({
            options: {
                position: "topleft",
            },
            onAdd: function () {
                const container = L.DomUtil.create(
                    "div",
                    "leaflet-bar leaflet-control border-0!"
                );

                L.DomEvent.disableClickPropagation(container);
                L.DomEvent.disableScrollPropagation(container);

                createRoot(container).render(
                    <Button
                        size="icon"
                        variant="secondary"
                        className="hover:bg-secondary/90"
                        onClick={() => {
                            map.setView([latitude, longitude], 10.5);
                        }}
                        title="Recentrer la carte"
                    >
                        <LocateFixed />
                    </Button>
                );

                return container;
            },
        });

        const control = new resetControl();
        map.addControl(control);

        return () => {
            map.removeControl(control);
        };
    }, [map, latitude, longitude]);

    return null;
}

function ZoomControl() {
    const map = useMap();

    useEffect(() => {
        const zoomControl = L.Control.extend({
            options: {
                position: "topleft",
            },
            onAdd: function () {
                const container = L.DomUtil.create(
                    "div",
                    "leaflet-bar leaflet-control flex flex-col gap-0.5 border-0!"
                );

                L.DomEvent.disableClickPropagation(container);
                L.DomEvent.disableScrollPropagation(container);

                createRoot(container).render(
                    <>
                        <Button
                            size="icon"
                            variant="secondary"
                            className="hover:bg-secondary/90"
                            onClick={() => {
                                map.zoomIn();
                            }}
                            title="Zoomer"
                        >
                            <Plus />
                        </Button>
                        <Button
                            size="icon"
                            variant="secondary"
                            className="hover:bg-secondary/90"
                            onClick={() => {
                                map.zoomOut();
                            }}
                            title="Dézoomer"
                        >
                            <Minus />
                        </Button>
                    </>
                );

                return container;
            },
        });

        const control = new zoomControl();
        map.addControl(control);

        return () => {
            map.removeControl(control);
        };
    }, [map]);

    return null;
}

export default function Map({ latitude, longitude, coordinates }: MapProps) {
    const polygonPoints = formatCoordinates(coordinates || []);

    return (
        <div className="relative z-0">
            <MapContainer
                center={[latitude, longitude]}
                zoom={10.5}
                // scrollWheelZoom={true}
                zoomControl={false}
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
                <ZoomControl />
                <ResetPositionControl
                    latitude={latitude}
                    longitude={longitude}
                />
            </MapContainer>
        </div>
    );
}
