"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
// @ts-expect-error leaflet's types are broken
import "leaflet/dist/leaflet.css";

interface MapProps {
    latitude: number;
    longitude: number;
    PopupContent?: string | React.ReactNode;
}

const DefaultIcon = L.icon({
    iconUrl: "/marker-icon.png",
    shadowUrl: "/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

export default function Map({ latitude, longitude, PopupContent }: MapProps) {
    return (
        <MapContainer
            center={[latitude, longitude]}
            zoom={13}
            scrollWheelZoom={false}
            style={{ height: "400px", width: "100%" }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            <Marker position={[latitude, longitude]} icon={DefaultIcon}>
                {PopupContent && <Popup>{PopupContent}</Popup>}
            </Marker>
        </MapContainer>
    );
}
