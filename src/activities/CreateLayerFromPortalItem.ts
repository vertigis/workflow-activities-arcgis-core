import type { IActivityHandler } from "@vertigis/workflow";
import Layer from "@arcgis/core/layers/Layer";

interface CreateLayerFromPortalItemInputs {
    /**
     * @description The ID of an ArcGIS portal item an object representing the item from which to load the layer.
     * @required
     */
    portalItem: string | { id: string };
}

interface CreateLayerFromPortalItemOutputs {
    /**
     * @description The layer result of the activity.
     */
    result: __esri.Layer;
}

/**
 * @category ArcGIS Maps SDK for JavaScript
 * @defaultName layer
 * @clientOnly
 * @description Creates a new layer instance of the appropriate layer class from an ArcGIS portal item.
 * @helpUrl https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-Layer.html#fromPortalItem
 * @supportedApps EXB, GWV
 */
export default class CreateLayerFromPortalItem implements IActivityHandler {
    async execute(inputs: CreateLayerFromPortalItemInputs): Promise<CreateLayerFromPortalItemOutputs> {
        const { portalItem } = inputs;
        if (!portalItem) {
            throw new Error("portalItem is required");
        }

        const item = typeof portalItem === "string" ? { id: portalItem } : portalItem;
        const result = await Layer.fromPortalItem({
            portalItem: item as __esri.PortalItem,
        });

        return {
            result,
        };
    }
}
