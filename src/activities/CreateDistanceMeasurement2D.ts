/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
    IActivityHandler,
    IActivityContext,
} from "@geocortex/workflow/runtime/IActivityHandler";
import { MapProvider } from "@geocortex/workflow/runtime/activities/arcgis/MapProvider";
import { activate } from "@geocortex/workflow/runtime/Hooks";
import DistanceMeasurement2D from "@arcgis/core/widgets/DistanceMeasurement2D";
import MapView from "@arcgis/core/views/MapView";

type removeFunction = () => void;
type linearMeasurementUnits = "metric" | "imperial" | "inches" | "feet" | "us-feet" | "yards" | "miles" | "nautical-miles" | "meters" | "kilometers";
type DistanceMeasurement2DResult = {
    length: number;
    geometry: any;
}

export interface CreateDistanceMeasurement2DInputs {
    /**
     * @description Unit system (imperial or metric) or specific unit used for distance values.
     */
    linearUnit?: linearMeasurementUnits | string;

}

export interface CreateDistanceMeasurement2DOutputs {

    measurement: DistanceMeasurement2DResult | undefined;

    /**
     * @description Function that removes the measurement from the map.
     */
    remove: removeFunction | undefined;
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
        let keyDown: ((event: KeyboardEvent) => void) | undefined;
        let measurement: DistanceMeasurement2DResult | undefined;

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
        let remove: removeFunction | undefined = () => measurementWidget.destroy();
        try {
            measurementWidget.viewModel.start();
            measurement = await new Promise((resolve) => {
                measurementWidget.watch("viewModel.state", function (state: string) {
                    if (state === "measured") {
                        resolve(measurementWidget.viewModel.measurement);
                    }
                });
                keyDown = (event: KeyboardEvent) => {
                    if (event.key === "ESC" || event.key === "Escape") {
                        resolve(undefined);
                    }
                };
                mapView.container.ownerDocument?.addEventListener("keydown", keyDown);

            });
        } finally {
            if (keyDown) {
                mapView.container.ownerDocument?.removeEventListener("keydown", keyDown);
            }
            //If there is no measurement to be returned then destroy the widget            
            if(!measurement) {
                remove();
                remove = undefined;
            }
        }

        return {
            measurement,
            remove,
        };

    }
}
