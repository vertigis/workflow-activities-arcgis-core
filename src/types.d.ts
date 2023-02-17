/*Measurement types*/
export type removeFunction = () => void;

export type linearMeasurementUnits = "metric" | "imperial" | "inches" | "feet" | "us-feet" | "yards" | "miles" | "nautical-miles" | "meters" | "kilometers";

export type areaMeasurementUnits = "metric" | "imperial" | "square-inches" | "square-feet" | "square-us-feet" | "square-yards" | "square-miles" | "square-meters" | "square-kilometers" | "acres" | "ares" | "hectares";

export type AreaMeasurement3DResult = {
    mode: "euclidean" | "geodesic";
    area: {
        text: string;
        state: string;
    };
    perimeterLength: {
        text: string;
        state: string;
    };
}

export type DirectLineMeasurement3DResult = {
    measurementMode: "euclidean" | "geodesic";
    directDistance: {
        text: string;
        state: string;
    };
    horizontalDistance: {
        text: string;
        state: string;
    };
    verticalDistance: {
        text: string;
        state: string;
    };
}

export type AreaMeasurement2DResult = {
    area: number;
    perimeter: number;
    geometry: any;
}

export type DistanceMeasurement2DResult = {
    length: number;
    geometry: any;
}
