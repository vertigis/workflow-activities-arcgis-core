/* eslint-disable @typescript-eslint/no-unused-vars */
import type MapView from "@arcgis/core/views/MapView";
import type {
    IActivityHandler,
    IActivityContext,
} from "@vertigis/workflow/IActivityHandler";
import { MapProvider } from "@vertigis/workflow/activities/arcgis/MapProvider";
import { activate } from "@vertigis/workflow/Hooks";

export interface TakeScreenshotInputs {
    /* eslint-disable @typescript-eslint/no-redundant-type-constituents */

    /**
     * @description The width of the screenshot (defaults to the area width).
     */
    width?: number;

    /**
     * @description The height of the screenshot (defaults to the area height).
     */
    height: number;

    /**
     * @description The format of the resulting encoded data URL. The default is png.
     */
    format?: "png" | "jpg" | string;

    /**
     * @description The quality (0 to 100) of the encoded image when the format is jpg. The default is 98.
     */
    quality?: number;

    /**
     * @description When used, only the visible layers in this list will be included in the output.
     */
    layers?: __esri.Layer[];

    /**
     * @description Specifies whether to take a screenshot of a specific area of the view.
     * The area coordinates are relative to the origin of the padded view and will be clipped to the view size. 
     * Defaults to the whole view (padding excluded).
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
     * @description Indicates whether to ignore the background color set in the initial view properties. The default is false.
     */
    ignoreBackground?: boolean;

    /**
     * @description Indicates whether the view padding should be ignored. The default is false.
     */
    ignorePadding?: boolean;
    
    /* eslint-enable @typescript-eslint/no-redundant-type-constituents */
}

export interface TakeScreenshotOutputs {
    /**
     * @description A data url representing the screenshot.
     */
    dataUrl: string;

    /**
     * @description The raw RGBA image data.
     */
    data: any;
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
