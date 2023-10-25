/* eslint-disable @typescript-eslint/no-unused-vars */
import type MapView from "@arcgis/core/views/MapView";
import type {
    IActivityHandler,
    IActivityContext,
} from "@geocortex/workflow/runtime/IActivityHandler";
import { MapProvider } from "@geocortex/workflow/runtime/activities/arcgis/MapProvider";
import { activate } from "@geocortex/workflow/runtime/Hooks";

export interface TakeScreenshotInputs {
    /**
     * @description The width of the screenshot (defaults to the area width).
     */
    width?: number;

    /**
     * @description The height of the screenshot (defaults to the area height).
     */
    height: number;

    /**
     * @description The format of the resulting encoded data URL.
     */
    format?: "png" | "jpg" | string;

    /**
     * @description The quality (0 to 100) of the encoded image when encoding as `jpg`.
     */
    quality?: number;

    /**
     * @description When used, only the visible layers in this list will be included in the output.
     */
    layers?: __esri.Layer[];

    /**
     * @description Specifies whether to take a screenshot of a specific area of the view.
     */
    area?: {
        /**
         * The x coordinate of the area.
         */
        x?: number;
        /**
         * The y coordinate of the area.
         */
        y?: number;
        /**
         * The width of the area.
         */
        width?: number;
        /**
         * The height of the area.
         */
        height?: number;
    };

    /**
     * @description Indicates whether to ignore the background color set in the initial view properties.
     */
    ignoreBackground?: boolean;

    /**
     * @description Indicates whether view padding should be ignored.
     */
    ignorePadding?: boolean;
}

export interface TakeScreenshotOutputs {
    /**
     * A data url representing the screenshot.
     */
    dataUrl: string;
}

/**
 * @defaultName screenshot
 * @category ArcGIS Maps SDK for JavaScript
 * @clientOnly
 * @description Create a screenshot of the current map view.
 * @helpUrl https://developers.arcgis.com/javascript/latest/api-reference/esri-views-MapView.html#takeScreenshot
 * @supportedApps EXB, GWV
 */
@activate(MapProvider)
export default class TakeScreenshot implements IActivityHandler {
    async execute(
        inputs: TakeScreenshotInputs,
        _context: IActivityContext,
        type: typeof MapProvider
    ): Promise<TakeScreenshotOutputs> {
        const mapProvider = type.create();
        await mapProvider.load();

        if (!mapProvider.map) {
            throw new Error("map is required");
        }

        const mapView = mapProvider.view as MapView;
        if (!mapView) {
            throw new Error("map view is required");
        }

        await mapView.when();

        const screenshot = await mapView.takeScreenshot(
            inputs as __esri.MapViewTakeScreenshotOptions
        );

        return {
            ...screenshot,
        };
    }
}
