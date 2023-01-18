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
export interface CreateSketchInputs {
    /**
     * @displayName Sketch Type
     * @required
     */
    sketchType:
        | "point"
        | "multipoint"
        | "polyline"
        | "polygon"
        | "rectangle"
        | "circle";

    /**
     * @displayName Graphics Layer Id
     * @required
     */
    layerId: string;

    /**
     * @displayName Symbol
     */
    // eslint-disable-next-line @typescript-eslint/ban-types
    symbol?: Symbol;

    /**
     * @displayName Create Options
     */
    createOptions?: any;
}

/** An interface that defines the outputs of the activity. */
export interface CreateSketchOutputs {
    /**
     * @description The result of the activity.
     */
    graphic: Graphic | undefined;
    layer: GraphicsLayer | undefined;
}

/**
 * @category ArcGIS Core
 * @clientOnly
 * @unsupportedApps GMV, GVH, WAB
 */
@activate(MapProvider)
export default class CreateSketch implements IActivityHandler {
    async execute(
        inputs: CreateSketchInputs,
        context: IActivityContext,
        type: typeof MapProvider
    ): Promise<CreateSketchOutputs> {
        const { symbol, layerId, sketchType, createOptions } = inputs;

        const mapProvider = type.create();
        await mapProvider.load();
        if (!mapProvider.map) {
            throw new Error("map is required");
        }

        const mapView = mapProvider.view as MapView;

        let layer: GraphicsLayer = mapView.map.allLayers.find(
            (x) => x.id == layerId && x.type == "graphics"
        ) as GraphicsLayer;
        if (layer == undefined) {
            layer = new GraphicsLayer({ id: layerId });
            mapView.map.layers.add(layer);
        }

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
            switch (sketchType) {
                case "polygon":
                case "rectangle":
                case "circle":
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
        view.create(sketchType, createOptions);
        const output: Graphic | undefined = await new Promise((resolve) => {
            view.on("create", function (event) {
                if (event.state === "complete") {
                    resolve(event.graphic);
                    view.destroy();
                } else if (event.state === "cancel") {
                    resolve(undefined);
                    view.destroy();
                }
            });
        });
        return {
            graphic: output,
            layer: layer,
        };
    }
}
