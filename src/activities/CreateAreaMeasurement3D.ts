/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
    IActivityHandler,
    IActivityContext,
} from "@vertigis/workflow/IActivityHandler";
import { MapProvider } from "@vertigis/workflow/activities/arcgis/MapProvider";
import { activate } from "@vertigis/workflow/Hooks";
import AreaMeasurement3D from "@arcgis/core/widgets/AreaMeasurement3D";
import SceneView from "@arcgis/core/views/SceneView";

/** An interface that defines the inputs of the activity. */
interface CreateAreaMeasurement3DInputs {
    /**
     * @description Unit system (imperial or metric) or specific unit used for area values.
     */
    areaUnit?: "metric" | "imperial" | "square-inches" | "square-feet" | "square-us-feet" | "square-yards" | "square-miles" | "square-meters" | "square-kilometers" | "acres" | "ares" | "hectares" | string;
}

interface CreateAreaMeasurement3DOutputs {

    mode?: "euclidean" | "geodesic";
    area?: {
        text: string;
        state: string;
    };
    perimeterLength?: {
        text: string;
        state: string;
    };

}

/**
 * @category ArcGIS Maps SDK for JavaScript
 * @clientOnly
 * @defaultName measure
 * @description Measure an area on a 3D map.
 * @helpUrl https://developers.arcgis.com/javascript/latest/sample-code/widgets-measurement-3d
 * @supportedApps EXB, GWV
 */
@activate(MapProvider)
export default class CreateAreaMeasurement3D implements IActivityHandler {
    async execute(inputs: CreateAreaMeasurement3DInputs,
        context: IActivityContext,
        type: typeof MapProvider): Promise<CreateAreaMeasurement3DOutputs> {
        const { areaUnit } = inputs;
        const mapProvider = type.create();
        await mapProvider.load();
        if (!mapProvider.view) {
            throw new Error("map view is required");
        }
        const mapView = mapProvider.view as SceneView;
        let watchHandle: __esri.WatchHandle | undefined;

        /**
         * Ideally this would be implemented using AreaMeasurement3DViewModel or DirectLineMeasurement3DViewModel
         * but there is an inconsistency in the Esri Widget View Model pattern with 
         * measurements that forces the creation of a widget.  A standalone view model 
         * does not initialize.
         **/
        const measurementWidget = new AreaMeasurement3D({
            view: mapView,
            unit: areaUnit as any,
        });

        measurementWidget.viewModel.start();
        const measurement: __esri.AreaMeasurement3DViewModelMeasurement | undefined
            = await new Promise((resolve) => {
                watchHandle = measurementWidget.watch("viewModel.state", function (state: string) {
                    if (state === "measured") {
                        resolve(measurementWidget.viewModel.measurement);
                    } else if (state === "ready") {
                        resolve(undefined);
                    }
                });

            });
        watchHandle?.remove();
        measurementWidget.destroy();

        return {
            ...measurement,
        };
    }
}
