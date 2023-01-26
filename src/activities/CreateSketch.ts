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
import { Symbol } from "@arcgis/core/symbols";
import MapView from "@arcgis/core/views/MapView";
import SketchDefaults from "./SketchDefaults";

export interface CreateSketchInputs {
    /**
     * @description This property reflects the create tool used to sketch the graphic.
     * @required
     */
    sketchType:
        | "point"
        | "multipoint"
        | "polyline"
        | "polygon"
        | "rectangle"
        | "circle"
        | string;

    /**
     * @displayName Graphics Layer Id
     * @description The Graphics layer to add the new graphic to.  If the layer does not exist in the map, a new one is created with the provided Id.
     * @required
     */
    layerId: string;

    /**
     * @description The Symbol to be used to render the sketch.
     */
    // eslint-disable-next-line @typescript-eslint/ban-types
    symbol?: Symbol;

    /**
     * @description Options for graphic to be created
     * @link https://developers.arcgis.com/javascript/latest/api-reference/esri-widgets-Sketch-SketchViewModel.html#create
     */
    createOptions?: __esri.SketchViewModelCreateCreateOptions;
}

export interface CreateSketchOutputs {
    graphic: Graphic | undefined;
    layer: GraphicsLayer | undefined;
}

/**
 * @category ArcGIS Maps SDK for JavaScript
 * @clientOnly
 * @description Sketch a graphic on the map with the geometry specified by the Sketch Type parameter.
 * @helpUrl https://developers.arcgis.com/javascript/latest/api-reference/esri-widgets-Sketch-SketchViewModel.html#create
 * @supportedApps EXB, GWV
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
            (x) => x.id === layerId && x.type === "graphics"
        ) as GraphicsLayer;
        if (!layer) {
            layer = new GraphicsLayer({ id: layerId });
            mapView.map.layers.add(layer);
        }

        const view = new SketchViewModel({
            view: mapView,
            layer: layer,
            pointSymbol: SketchDefaults.defaultPointSymbol,
            polygonSymbol: SketchDefaults.defaultPolygonSymbol,
            polylineSymbol: SketchDefaults.defaultPolylineSymbol,
        });
        if (symbol != undefined) {
            switch (symbol.type) {
                case "simple-fill":
                    view.polygonSymbol = symbol;
                    break;
                case "simple-marker":
                    view.pointSymbol = symbol;
                    break;
                case "simple-line":
                    view.polylineSymbol = symbol;
            }
        } 
        view.create(sketchType as any, createOptions);
        const output: Graphic | undefined = await new Promise((resolve) => {
            view.on("create", function (event) {
                if (event.state === "complete") {
                    resolve(event.graphic);
                } else if (event.state === "cancel") {
                    resolve(undefined);
                }
            });
        });
        view.destroy();        
        return {
            graphic: output,
            layer: layer,
        };

    }
}
