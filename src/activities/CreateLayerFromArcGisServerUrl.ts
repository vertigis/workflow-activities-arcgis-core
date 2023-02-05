import type { IActivityHandler } from "@geocortex/workflow/runtime";
import Layer from "@arcgis/core/layers/Layer";

interface CreateLayerFromArcGisServerUrlInputs {
    /**
     * @displayName URL
     * @description The URL to the ArcGIS Server service.
     * @required
     */
    url: string;

    /**
     * @description Any of the layer's properties for constructing the layer instance (e.g. popupTemplate, renderer, etc.).
     */
    properties?: any;
}

interface CreateLayerFromArcGisServerUrlOutputs {
    /**
     * @description The layer result of the activity.
     */
    result: __esri.Layer;
}

/**
 * @category ArcGIS Maps SDK for JavaScript
 * @defaultName layer
 * @displayName Create Layer From ArcGIS Server URL
 * @clientOnly
 * @description Creates a new layer instance from an ArcGIS Server URL.
 * @helpUrl https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-Layer.html#fromArcGISServerUrl
 * @supportedApps EXB, GWV
 */
export default class CreateLayerFromArcGisServerUrl implements IActivityHandler {
    async execute(inputs: CreateLayerFromArcGisServerUrlInputs): Promise<CreateLayerFromArcGisServerUrlOutputs> {
        const { url, properties } = inputs;
        if (!url) {
            throw new Error("url is required");
        }

        const result = await Layer.fromArcGISServerUrl({
            url,
            properties
        });

        return {
            result,
        };
    }
}
