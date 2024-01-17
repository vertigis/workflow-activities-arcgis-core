/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
    IActivityHandler,
    IActivityContext,
} from "@vertigis/workflow/IActivityHandler";
import { MapProvider } from "@vertigis/workflow/activities/arcgis/MapProvider";
import { activate } from "@vertigis/workflow/Hooks";
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel";
import Graphic from "@arcgis/core/Graphic";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import { Symbol } from "@arcgis/core/symbols";

import MapView from "@arcgis/core/views/MapView";
import SketchDefaults from "./SketchDefaults";

interface UpdateSketchInputs {
    /**
     * @description A graphic or an array of graphics to be updated.
     * @required
     */
    graphics?: Graphic | Graphic[];

    /**
     * @description A graphic or an array of graphics to be updated.
     * @required
     */
    layer?: GraphicsLayer;

    /**
     * @description The Symbol to be used to render the sketch.
     */
    // eslint-disable-next-line @typescript-eslint/ban-types
    symbol?: Symbol;

    /**
     * @description Update options for the graphics to be updated.
     * @link https://developers.arcgis.com/javascript/latest/api-reference/esri-widgets-Sketch-SketchViewModel.html#update
     */
    updateOptions?: __esri.SketchViewModelDefaultUpdateOptions;
}

interface UpdateSketchOutputs {
    layer: GraphicsLayer;
    graphics: Graphic[] | undefined;
}

/**
 * @category ArcGIS Maps SDK for JavaScript
 * @description Initializes an update operation for the specified graphic(s).
 * @helpUrl https://developers.arcgis.com/javascript/latest/api-reference/esri-widgets-Sketch-SketchViewModel.html#update
 * @clientOnly
 * @supportedApps EXB, GWV
 * */
@activate(MapProvider)
export default class UpdateSketch implements IActivityHandler {
    async execute(inputs: UpdateSketchInputs, context: IActivityContext,
        type: typeof MapProvider): Promise<UpdateSketchOutputs> {
        const { graphics, layer, symbol, updateOptions } = inputs;
        const mapProvider = type.create();
        await mapProvider.load();
        if (!mapProvider.view) {
            throw new Error("view is required");
        }
        if (!layer) {
            throw new Error("layer is required");
        }

        if (!graphics) {
            throw new Error("graphics are required");
        }
        const mapView = mapProvider.view as MapView;
        let updatedGraphics: Graphic[] | undefined = undefined;
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

        await view.update(graphics, updateOptions);
        updatedGraphics = await new Promise((resolve) => {
            view.on("update", function (event) {
                if (event.state === "complete") {
                    resolve(event.graphics);
                } else if (event.aborted) {
                    resolve(undefined);
                }

            });
        });


        view.destroy();
        return {
            layer,
            graphics: updatedGraphics,
        };
    }
}
