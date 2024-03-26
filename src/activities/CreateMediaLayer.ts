import type { IActivityHandler } from "@vertigis/workflow";
import MediaLayer from "@arcgis/core/layers/MediaLayer";

interface CreateMediaLayerInputs {
    /**
     * @description The sources of the media layer.
     * @required
     */
    source:
        | __esri.ImageElement
        | __esri.LocalMediaElementSource
        | __esri.VideoElement
        | any[];
    /**
     * @description The title of the layer.
     */
    title?: string;
    /**
     * @description Any of the layer's properties for constructing the layer instance (e.g. blendMode, opacity, etc.).
     */
    properties?: __esri.MediaLayerProperties;
}

interface CreateMediaLayerOutputs {
    /**
     * @description The layer result of the activity.
     */
    result: __esri.MediaLayer;
}

/**
 * @category ArcGIS Maps SDK for JavaScript
 * @defaultName mediaLayer
 * @clientOnly
 * @description Creates a new media layer containing image and video elements at specified geographic locations.
 * @helpUrl https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-MediaLayer.html
 * @supportedApps EXB, GWV
 */
export default class CreateMediaLayer implements IActivityHandler {
    execute(
        inputs: CreateMediaLayerInputs,
    ): CreateMediaLayerOutputs {
        const { properties, source, title } = inputs;
        if (!source) {
            throw new Error("source is required");
        }

        const layer = new MediaLayer({
            source,
            title,
            ...properties,
        });

        return {
            result: layer,
        };
    }
}
