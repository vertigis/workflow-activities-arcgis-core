/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
    IActivityHandler,
    IActivityContext,
} from "@geocortex/workflow/runtime/IActivityHandler";
import { MapProvider } from "@geocortex/workflow/runtime/activities/arcgis/MapProvider";
import { activate } from "@geocortex/workflow/runtime/Hooks";
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel";
import Graphic from "@arcgis/core/Graphic";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import MapView from "@arcgis/core/views/MapView";

export interface DeleteSketchInputs {
    /**
     * @description A graphic or an array of graphics to be updated.
     * @required
     */
    graphics?: Graphic | Graphic[];

}

export interface DeleteSketchOutputs {
    layer: GraphicsLayer;
}

/**
 * @category ArcGIS Core
 * @description Deletes graphics defined in the Graphics parameter from the map.
 * @clientOnly
 * @supportedApps EXB, GWV
 * */
@activate(MapProvider)
export default class DeleteSketch implements IActivityHandler {
    async execute(
        inputs: DeleteSketchInputs,
        context: IActivityContext,
        type: typeof MapProvider
    ): Promise<DeleteSketchOutputs> {
        const { graphics } = inputs;
        const mapProvider = type.create();
        await mapProvider.load();
        if (!mapProvider.map) {
            throw new Error("map is required");
        }
        if (!graphics) {
            throw new Error("graphics is required")
        }
        const mapView = mapProvider.view as MapView;
        const layer = graphics[0].layer;
        const view = new SketchViewModel({
            view: mapView,
            layer: layer,
        });

        await view.update(graphics);
        await new Promise((resolve) => {
            view.on("update", function (event) {
                if (event.state === "active") {
                    view.delete();
                    resolve(true);
                }
            });
            // In order to delete the provided graphic we need to add the graphic via update() which, sets the active 
            // graphic, and then emit an update event to delete it.  This is the recommended approach from Esri 
            // https://developers.arcgis.com/javascript/latest/api-reference/esri-widgets-Sketch-SketchViewModel.html#delete
            view.emit("update", {
                graphic: graphics,
                state: "active",
                tool: "point",
                toolEventInfo: {},
                type: "create"
            });
        });
        view.destroy();
        return {
            layer,
        };
    }
}
