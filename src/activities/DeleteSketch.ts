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
import Symbol from "@arcgis/core/symbols/Symbol";
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol";
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol";
import SimpleLineSymbol from "@arcgis/core/symbols/SimpleLineSymbol";
import MapView from "@arcgis/core/views/MapView";
import SketchDefaults from "./SketchDefaults";

export interface DeleteSketchInputs {
    /**
     * @description A graphic or an array of graphics to be updated. Only graphics added to layer input can be deleted.
     * @required
     */
    graphics: Graphic | Graphic[];    
        
    /**
     * @description The Graphics Layer the contains the graphics to be deleted.
     * @required
     */
    layer: GraphicsLayer;

}

export interface DeleteSketchOutputs {
    layer: GraphicsLayer;
}

/**
 * @category ArcGIS Core
 * @description Captures a point on the map.
 * @clientOnly
 * @unsupportedApps GMV, GVH, WAB
 * */
@activate(MapProvider)
export default class DeleteSketch implements IActivityHandler {
    async execute(
        inputs: DeleteSketchInputs,
        context: IActivityContext,
        type: typeof MapProvider
    ): Promise<DeleteSketchOutputs> {
        const { graphics, layer} = inputs;
        const mapProvider = type.create();
        await mapProvider.load();
        if (!mapProvider.map) {
            throw new Error("map is required");
        }
        const geometryType = Array.isArray(graphics)
            ? graphics[0].geometry.type
            : graphics.geometry.type;
        const mapView = mapProvider.view as MapView;

        const view = new SketchViewModel({
            view: mapView,
            layer: layer,
        });
              
        await view.update(graphics);
        await new Promise((resolve) => {
            view.on("update", function (event) {
                if (event.state === "active") {
                    view.delete();
                    view.destroy();
                    resolve(true);
                  }
            });
            view.emit("update", {
                graphic: graphics,
                state: "active",
                tool: "point",
                toolEventInfo: {},
                type: "create"
                });
        });

        return {
            layer,
        };
    }
}
