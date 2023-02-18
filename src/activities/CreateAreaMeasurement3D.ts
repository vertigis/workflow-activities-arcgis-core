/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
    IActivityHandler,
    IActivityContext,
} from "@geocortex/workflow/runtime/IActivityHandler";
import { MapProvider } from "@geocortex/workflow/runtime/activities/arcgis/MapProvider";
import { activate } from "@geocortex/workflow/runtime/Hooks";
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

    measurement?: {
        mode: "euclidean" | "geodesic";
        area: {
            text: string;
            state: string;
        };
        perimeterLength: {
            text: string;
            state: string;
        };
    };
    /**
     * @description Function that removes the measurement from the map.
     */
    remove?: () => void;

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
        let measurement: __esri.AreaMeasurement3DViewModelMeasurement | undefined;
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
        let remove: (() => void) | undefined = () => measurementWidget.destroy();

        try {
            measurementWidget.viewModel.start();
            measurement = await new Promise((resolve) => {
                watchHandle = measurementWidget.watch("viewModel.state", function (state: string) {
                    if (state === "measured") {
                        resolve(measurementWidget.viewModel.measurement);
                    } else if (state === "ready") {
                        resolve(undefined);
                    }
                });

            });
        } finally {
            //If there is no measurement to be returned then destroy the widget
            if (!measurement) {
                remove();
                remove = undefined;
            }
            watchHandle?.remove();

        }
        return {
            measurement,
            remove,
        };
    }
}
