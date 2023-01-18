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

/** An interface that defines the inputs of the activity. */
interface UpdateSketchInputs {
    /**
     * @displayName Graphics
     * @required
     */
    graphics: Graphic | Graphic[];        
    /**
     * @displayName Layer
     * @required
     */
    layer: GraphicsLayer;

    /**
     * @displayName Symbol
     */
    // eslint-disable-next-line @typescript-eslint/ban-types
    symbol?: Symbol;  

    /**
     * @displayName Update Options
     */
    updateOptions?: any;    
}

/** An interface that defines the outputs of the activity. */
interface UpdateSketchOutputs {
    /**
     * @description The result of the activity.
     */
    layer: GraphicsLayer;
    graphics: Graphic[];
}

/**
 * @category ArcGIS Core
 * @description Captures a point on the map.
 * @clientOnly
 * @unsupportedApps GMV, GVH, WAB
 * */
@activate(MapProvider)
export default class UpdateSketch implements IActivityHandler {
    async execute(inputs: UpdateSketchInputs, context: IActivityContext,
        type: typeof MapProvider): Promise<UpdateSketchOutputs> {
        const { graphics, layer, symbol } = inputs;
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
        if (symbol != undefined) {
            switch (symbol.type) {
                case "simple-fill":
                    view.polygonSymbol = symbol as SimpleFillSymbol;
                    break;
                case "simple-marker":
                    view.pointSymbol = symbol as SimpleMarkerSymbol;
                    break;
                case "simple-line":
                    view.polylineSymbol = symbol as SimpleLineSymbol;
            }
        } else {
            switch (geometryType) {
                case "polygon":
                case "extent":
                    view.polygonSymbol = SketchDefaults.defaultPolygonSymbol;
                    break;
                case "point":
                case "multipoint":
                    view.pointSymbol = SketchDefaults.defaultPointSymbol;
                    break;
                case "polyline":
                    view.polylineSymbol = SketchDefaults.defaultPolylineSymbol;
            }
        }
        await view.update(graphics);
        
        const updatedGraphics: Graphic[] = await new Promise((resolve) => {
            view.on("update", function (event) {
                if (event.state === "complete") {
                    resolve(event.graphics);
                    view.destroy();
                  } 
            });
        });
        return {
            layer,
            graphics: updatedGraphics,
        };
    }
}

