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
 * @category ArcGIS Maps SDK for JavaScript
 * @description Allows the user to select a graphic on the map.
 * @clientOnly
 * @supportedApps EXB, GWV
 * */
@activate(MapProvider)
export default class SelectGraphics implements IActivityHandler {

    async execute(inputs: SelectGraphicInputs, context: IActivityContext,
        type: typeof MapProvider): Promise<SelectGraphicOutputs> {
        const { layer } = inputs;
        const mapProvider = type.create();
        await mapProvider.load();
        let pointerHandle: IHandle;
        let clickHandle: IHandle;
        let keydown;
        if (!mapProvider.view) {
            throw new Error("view is required");
        }
        if (!layer) {
            throw new Error("layer is required");
        }
        const mapView = mapProvider.view as MapView;

        const graphic: Graphic | undefined = await new Promise((resolve) => {
            pointerHandle = mapView.on("pointer-move", (event: __esri.ViewPointerMoveEvent) => {
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
            clickHandle = mapView.on("click", (event: __esri.ViewClickEvent) => {
                void mapView.hitTest(event).then((hitResult: __esri.HitTestResult) => {

                    const results = hitResult.results.filter((result) => result.layer === layer);
                    if (results.length > 0) {
                        if (results[0].type === "graphic") {
                            pointerHandle.remove();
                            clickHandle.remove();
                            mapView.container.ownerDocument?.removeEventListener("keydown", keydown);
                            mapView.container.style.cursor = "default";
                            resolve(results[0].graphic);
                        }
                    }

                });

            });
            keydown = (event: KeyboardEvent) => {
                if (event.key === "ESC" || event.key === "Escape") {
                    event.stopPropagation();
                    pointerHandle.remove();
                    clickHandle.remove();
                    mapView.container.ownerDocument?.removeEventListener("keydown", keydown);
                    mapView.container.style.cursor = "default";
                    resolve(undefined);
                }
            };
            mapView.container.ownerDocument?.addEventListener("keydown", keydown);
        });
        
        return {
            graphic,
        };
    }
}