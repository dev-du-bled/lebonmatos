type AddressFeature = {
    type: "Feature";
    geometry: {
        type: "Point";
        coordinates: [number, number];
    };
    properties: {
        label: string;
        score: number;
        id: string;
        type: string;
        name: string;
        postcode: string;
        citycode: string;
        x: number;
        y: number;
        population: number;
        city: string;
        context: string;
        importance: number;
        municipality: string;
        _type: string;
    };
};

type RawAddressResponse = {
    type: "FeatureCollection";
    features: AddressFeature[];
    query: string;
};

export type AddressData = {
    label: string;
    coordinates: [number, number];
    context: string;
};

/**
 * Search for an address using the API-Adresse Data Gouv API
 *
 * @param query - The query to search for
 * @param limit - The maximum number of results to return
 */
export async function searchAddress(
    query: string,
    limit: number
): Promise<AddressData[]> {
    const response = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(
            query
        )}&limit=${limit}`
    );

    const data = (await response.json()) as RawAddressResponse;

    return data.features.map((feature) => ({
        label: feature.properties.label,
        coordinates: feature.geometry.coordinates,
        context: feature.properties.context,
    }));
}
