type ResponseCityData = {
    lat: string;
    lon: string;
    addresstype: string;
    name: string;
    display_name: string;
    address: {
        city: string;
        state: string;
        region: string;
        country: string;
        country_code: string;
    };
    boundingbox: [string, string, string, string];
    geojson: {
        type: "Polygon" | "MultiPolygon";
        coordinates: number[][][] | number[][][][];
    };
};

export type CityData = {
    lat: number;
    lon: number;
    name: string;
    displayName: string;
    city: string;
    state: string;
    region: string;
    country: string;
    countryCode: string;
    coordinates: number[];
};

const palceFilters = ["city", "town", "village", "hamlet", "suburb"];

export async function searchAddress(
    query: string,
    limit: number
): Promise<CityData[]> {
    const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&addressdetails=1&format=json&polygon_geojson=1&limit=${limit}`
    );

    const data = (await response.json()) as ResponseCityData[];

    return data
        .filter((item) => {
            if (
                !palceFilters.includes(item.addresstype) ||
                (item.geojson.type !== "Polygon" &&
                    item.geojson.type !== "MultiPolygon")
            )
                return false;
            return true;
        })
        .map((item) => ({
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
            name: item.name,
            displayName: item.display_name,
            city: item.address.city || item.name,
            state: item.address.state || "",
            region: item.address.region || "",
            country: item.address.country || "",
            countryCode: item.address.country_code || "",
            coordinates: flattenCoordinates(item.geojson),
        }));
}

function flattenCoordinates(geojson: {
    type: "Polygon" | "MultiPolygon";
    coordinates: number[][][] | number[][][][];
}): number[] {
    if (geojson.type === "Polygon") {
        const ring = geojson.coordinates[0] as number[][];
        return ring.flatMap((coord) => coord);
    } else if (geojson.type === "MultiPolygon") {
        const ring = (geojson.coordinates as number[][][][])[0][0];
        return ring.flatMap((coord) => coord);
    }
    return [];
}

// we store coordinates in DB as an array of numbers [lon, lat, lon, lat...]
// leaflet need them as an array of [lat, lon] pairs
export function formatCoordinates(coords: number[]): [number, number][] {
    const result: [number, number][] = [];
    for (let i = 0; i < coords.length; i += 2) {
        if (i + 1 < coords.length) {
            result.push([coords[i + 1], coords[i]]);
        }
    }
    return result;
}
