import type { IActivityHandler } from "@vertigis/workflow";
import { MapProvider } from "@vertigis/workflow/activities/arcgis/MapProvider";
import type { IActivityContext } from "@vertigis/workflow/IActivityHandler";
import WebMap from "@arcgis/core/WebMap";
import GroupLayer from "@arcgis/core/layers/GroupLayer";
import { activate } from "@vertigis/workflow/Hooks";

interface CreateGroupLayerInputs {
    /**
     * @description The title of the group layer to create.
     */
    title?: string;

    /**
     * @description Any of the layer's properties for constructing the layer instance (e.g. blendMode, opacity, etc.).
     */
    properties?: __esri.GroupLayerProperties;
}

interface CreateGroupLayerOutputs {
    /**
     * @description The new Group Layer.
     */
    result: __esri.GroupLayer;
}

/**
 * @clientOnly
 * @category ArcGIS Maps SDK for JavaScript
 * @helpUrl https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-GroupLayer.html
 * @description Creates a new group layer item
 * @supportedApps EXB, GWV
 */
export default class CreateGroupLayer implements IActivityHandler {
    
    async execute(inputs: CreateGroupLayerInputs): Promise<CreateGroupLayerOutputs> {
        const { properties, title } = inputs;
        const layer = new GroupLayer({ title, ...properties });  

        return { result: layer };
    }
}
