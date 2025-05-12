import type { IActivityHandler } from "@vertigis/workflow";
import MediaLayer from "@arcgis/core/layers/MediaLayer";
import ImageElement from "@arcgis/core/layers/support/ImageElement";
import VideoElement from "@arcgis/core/layers/support/VideoElement";
import LocalMediaElementSource from "@arcgis/core/layers/support/LocalMediaElementSource.js";

interface CreateMediaLayerInputs {
    /**
     * @description The sources of the media layer.
     * @required
     */
    source:
    | __esri.ImageElement
    | __esri.LocalMediaElementSource
    | __esri.VideoElement
    | __esri.ImageElementProperties
    | __esri.VideoElementProperties
    | __esri.LocalMediaElementSourceProperties;
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
        let {source } = inputs;
        const { properties, title } = inputs;

        if (!source) {
            throw new Error("source is required");
        }

        if (!(source instanceof ImageElement ||
            source instanceof LocalMediaElementSource ||
            source instanceof VideoElement)) {

            if ((source as __esri.ImageElementProperties).image) {
                source = new ImageElement(source as __esri.ImageElementProperties);
            } else if ((source as __esri.VideoElementProperties).video) {
                source = new VideoElement(source as __esri.VideoElementProperties);
            } else {
                source = new LocalMediaElementSource(source as __esri.LocalMediaElementSourceProperties);
            }
        }

        const layer = new MediaLayer({
            source: source as __esri.ImageElement | __esri.VideoElement | __esri.LocalMediaElementSource,
            title,
            ...properties,
        });

        return {
            result: layer,
        };
    }
}
