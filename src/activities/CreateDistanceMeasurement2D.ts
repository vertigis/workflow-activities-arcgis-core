/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
    IActivityHandler,
    IActivityContext,
} from "@geocortex/workflow/runtime/IActivityHandler";
import { MapProvider } from "@geocortex/workflow/runtime/activities/arcgis/MapProvider";
import { activate } from "@geocortex/workflow/runtime/Hooks";
import DistanceMeasurement2D from "@arcgis/core/widgets/DistanceMeasurement2D";
import MapView from "@arcgis/core/views/MapView";

export interface CreateDistanceMeasurement2DInputs {
    /**
     * @description Unit system (imperial or metric) or specific unit used for distance values.
     */
    linearUnit?: "metric" | "imperial" | "inches" | "feet" | "us-feet" | "yards" | "miles" | "nautical-miles" | "meters" | "kilometers" | string;

}

export interface CreateDistanceMeasurement2DOutputs {

    measurement?: {
        length: number;
        geometry: any;
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
 * @description Measure a distance on a 2D map.
 * @helpUrl https://developers.arcgis.com/javascript/latest/sample-code/widgets-measurement-2d
 * @supportedApps EXB, GWV
 */
@activate(MapProvider)
export default class CreateDistanceMeasurement2D implements IActivityHandler {
    async execute(
        inputs: CreateDistanceMeasurement2DInputs,
        context: IActivityContext,
        type: typeof MapProvider
    ): Promise<CreateDistanceMeasurement2DOutputs> {
        const { linearUnit } = inputs;
        const mapProvider = type.create();
        await mapProvider.load();
        if (!mapProvider.map) {
            throw new Error("map is required");
        }

        const mapView = mapProvider.view as MapView;
        let measurement: __esri.DistanceMeasurement2DViewModelMeasurement | undefined;
        let watchHandle: __esri.WatchHandle | undefined;
        /**
         * Ideally this would be implemented using AreaMeasurement2DViewModel or DistanceMeasurement2DViewModel
         * but there is an inconsistency in the Esri Widget View Model pattern with 
         * measurements that forces the creation of a widget.  A standalone view model 
         * does not initialize.
         **/
        const measurementWidget = new DistanceMeasurement2D({
            view: mapView,
            unit: linearUnit as any,
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
