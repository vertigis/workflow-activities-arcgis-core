/* eslint-disable @typescript-eslint/no-unused-vars */
import type { IActivityHandler } from "@geocortex/workflow/runtime";
import { MapProvider } from "@geocortex/workflow/runtime/activities/arcgis/MapProvider";
import { activate } from "@geocortex/workflow/runtime/Hooks";
import type { IActivityContext } from "@geocortex/workflow/runtime/IActivityHandler";
import Layer from "@arcgis/core/layers/Layer";
import WebMap from "@arcgis/core/WebMap";

interface AddLayerToMapInputs {
    /**
     * @description The layer or layers to add.
     * @required
     */
    layer?: Layer | Layer[];
    /**
     * @description The index at which to add the layer or layers.
     */
    index?: number;
}

interface AddLayerToMapOutputs {
}

/**
 * @category ArcGIS Maps SDK for JavaScript
 * @clientOnly
 * @description Adds one or more layers to the map's layers collection.
 * @helpUrl https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-Layer.html#fromPortalItem
 * @supportedApps EXB, GWV
 */
@activate(MapProvider)
export default class AddLayerToMap implements IActivityHandler {
    async execute(inputs: AddLayerToMapInputs, _context: IActivityContext, type: typeof MapProvider): Promise<AddLayerToMapOutputs> {
        const { index, layer } = inputs;
        if (!layer) {
            throw new Error("layer is required");
        }

        const mapProvider = type.create();
        await mapProvider.load();

        const map = mapProvider.map as WebMap;
        if (!map) {
            throw new Error("map is required");
        }

        const layers = Array.isArray(layer) ? layer : [layer];
        map.addMany(layers, index);

        return {};
    }
}
