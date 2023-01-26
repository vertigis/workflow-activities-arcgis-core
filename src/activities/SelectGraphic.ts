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

interface SelectGraphicsInputs {
    /**
     * @description A graphics layer that contains the graphics to be selected.
     * @required
     */
    layer?: GraphicsLayer;

}

interface SelectGraphicsOutputs {
    /**
     * @description The selected graphics.
     */
    graphics: Graphic[] | undefined;
}

/**
 * @category ArcGIS Maps SDK for JavaScript
 * @description Allows the user to select a graphic on the map.
 * @clientOnly
 * @supportedApps EXB, GWV
 * */
@activate(MapProvider)
export default class SelectGraphics implements IActivityHandler {

    async execute(inputs: SelectGraphicsInputs, context: IActivityContext,
        type: typeof MapProvider): Promise<SelectGraphicsOutputs> {

        let pointerHandle: __esri.Handle | undefined;
        let clickHandle: __esri.Handle | undefined;
        let highlightHandle: __esri.Handle | undefined;
        let keyDown;
        let graphics: Graphic[] | undefined;
        const { layer } = inputs;
        const mapProvider = type.create();

        await mapProvider.load();
        if (!mapProvider.view) {
            throw new Error("map view not found");
        }
        if (!layer) {
            throw new Error("layer is required");
        }
        const mapView = mapProvider.view as MapView;
        const layerView = await mapView.whenLayerView(layer);

        try {
            graphics = await new Promise((resolve) => {
                pointerHandle = mapView.on("pointer-move", (event: __esri.ViewPointerMoveEvent) => {
                    void (async () => {
                        const hitResult = await mapView.hitTest(event, { include: layer, });
                        highlightHandle?.remove();
                        const hit = hitResult.results.some((result) => result.layer === layer);
                        if (hit) {
                            const graphics = (hitResult.results as __esri.GraphicHit[]).map(x => x.graphic);
                            highlightHandle = layerView.highlight(graphics);
                        }
                    })();
                });
                clickHandle = mapView.on("click", (event: __esri.ViewClickEvent) => {
                    void (async () => {
                        const hitResult = await mapView.hitTest(event, { include: layer, });
                        const results = hitResult.results.some((result) => result.layer === layer);
                        if (results) {
                            const hitResults = hitResult.results.filter(x => x.type === "graphic" && x.layer === layer);
                            const graphics = (hitResults as __esri.GraphicHit[]).map(x => x.graphic);
                            resolve(graphics);
                        }
                    })();
                    void mapView.hitTest(event).then((hitResult: __esri.HitTestResult) => {
                        const results = hitResult.results.some((result) => result.layer === layer);
                        if (results) {
                            const hitResults = hitResult.results.filter(x => x.type === "graphic" && x.layer === layer);
                            const graphics = (hitResults as __esri.GraphicHit[]).map(x => x.graphic);
                            resolve(graphics);
                        }
                    });

                });
                keyDown = (event: KeyboardEvent) => {
                    if (event.key === "ESC" || event.key === "Escape") {
                        resolve(undefined);
                    }
                };
                mapView.container.ownerDocument?.addEventListener("keydown", keyDown);
            });
        } finally {
            pointerHandle?.remove();
            clickHandle?.remove();
            highlightHandle?.remove();
            if (keyDown) {
                mapView.container.ownerDocument?.removeEventListener("keydown", keyDown);
            }
        }

        return {
            graphics,
        };
    }
}