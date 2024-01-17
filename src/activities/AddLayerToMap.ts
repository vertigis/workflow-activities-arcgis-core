/* eslint-disable @typescript-eslint/no-unused-vars */
import type { IActivityHandler } from "@vertigis/workflow";
import { MapProvider } from "@vertigis/workflow/activities/arcgis/MapProvider";
import { activate } from "@vertigis/workflow/Hooks";
import type { IActivityContext } from "@vertigis/workflow/IActivityHandler";
import WebMap from "@arcgis/core/WebMap";

interface AddLayerToMapInputs {
    /**
     * @description The layer or layers to add.
     * @required
     */
    layer?: __esri.Layer | __esri.Layer[];
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
