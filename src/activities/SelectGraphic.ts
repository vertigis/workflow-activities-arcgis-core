/* eslint-disable @typescript-eslint/no-unused-vars */
import Graphic from "@arcgis/core/Graphic";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import type {
    IActivityHandler,
    IActivityContext,
} from "@geocortex/workflow/runtime/IActivityHandler";
import { MapProvider } from "@geocortex/workflow/runtime/activities/arcgis/MapProvider";
import { activate } from "@geocortex/workflow/runtime/Hooks";
import MapView from "@arcgis/core/views/MapView";

interface SelectGraphicInputs {
    /**
     * @description A graphics layer that contains the graphic to be selected.
     * @required
     */
    layer?: GraphicsLayer;

}

interface SelectGraphicOutputs {
    /**
     * @description The selected graphic.
     */
    graphic: Graphic | undefined;
}

/**
 * @description Allows the user to select a graphics on the map.
 * @category ArcGIS Core
 * @clientOnly
 * @supportedApps EXB, GWV
 * */
@activate(MapProvider)
export default class SelectGraphics implements IActivityHandler {
    /** Perform the execution logic of the activity. */

    async execute(inputs: SelectGraphicInputs, context: IActivityContext,
        type: typeof MapProvider): Promise<SelectGraphicOutputs> {
        const { layer } = inputs;
        const mapProvider = type.create();
        await mapProvider.load();
        let h1;
        let h2;
        let keydown;
        if (!mapProvider.view) {
            throw new Error("view is required");
        }
        if (!layer) {
            throw new Error("layer is required");
        }
        const mapView = mapProvider.view as MapView;

        const graphic: Graphic | undefined = await new Promise((resolve) => {
            h1 = mapView.on("pointer-move", (event: __esri.ViewPointerMoveEvent) => {
                void mapView.hitTest(event).then((hitResult: __esri.HitTestResult) => {
                    const hit: boolean = hitResult.results.filter((result) => result.layer === layer).length > 0;
                    if (hit) {
                        mapView.container.style.cursor = "pointer";
                    } else {
                        mapView.container.style.cursor = "default";
                    }
                    event.stopPropagation();

                });
            });
            h2 = mapView.on("click", (event: __esri.ViewClickEvent) => {
                void mapView.hitTest(event).then((hitResult: __esri.HitTestResult) => {

                    const results = hitResult.results.filter((result) => result.layer === layer);
                    if (results.length > 0) {
                        if (results[0].type === "graphic") {
                            h1.remove();
                            resolve(results[0].graphic);
                        }
                    }

                });

            });
            keydown = (event: KeyboardEvent) => {
                if (event.key === "ESC" || event.key === "Escape") {
                    event.stopPropagation();
                    h1.remove();
                    resolve(undefined);
                }
            };
            mapView.container.ownerDocument?.addEventListener("keydown", keydown);
        });

        mapView.container.style.cursor = "default";
        h2.remove();
        mapView.container.ownerDocument?.removeEventListener("keydown", keydown);
        return {
            graphic,
        };
    }
}