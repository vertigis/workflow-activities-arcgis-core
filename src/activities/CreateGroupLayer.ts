import type { IActivityHandler } from "@vertigis/workflow";
import { MapProvider } from "@vertigis/workflow/activities/arcgis/MapProvider";
import type { IActivityContext } from "@vertigis/workflow/IActivityHandler";
import WebMap from "@arcgis/core/WebMap";
import GroupLayer from "@arcgis/core/layers/GroupLayer";
import { activate } from "@vertigis/workflow/Hooks";

interface CreateGroupLayerInputs {
    /**
     * @description The name of the group layer to create.
     * @required
     */
    name?: string;
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
 */
@activate(MapProvider)
export default class CreateGroupLayer implements IActivityHandler {
    
    async execute(inputs: CreateGroupLayerInputs, context: IActivityContext, type: typeof MapProvider): Promise<CreateGroupLayerOutputs> {
        const { name } = inputs;
        if (!name) {
            throw new Error("name is required");
        }
        
        const mapProvider = type.create();
        await mapProvider.load();

        const map = mapProvider.map as WebMap;
        if (!map) {
            throw new Error("map is required");
        }

        const layer = new GroupLayer({ title: name });  
        map.add(layer);

        return { result: layer };
    }
}
