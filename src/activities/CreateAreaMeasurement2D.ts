/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
    IActivityHandler,
    IActivityContext,
} from "@vertigis/workflow/IActivityHandler";
import { MapProvider } from "@vertigis/workflow/activities/arcgis/MapProvider";
import { activate } from "@vertigis/workflow/Hooks";
import AreaMeasurement2D from "@arcgis/core/widgets/AreaMeasurement2D";
import MapView from "@arcgis/core/views/MapView";

interface CreateAreaMeasurement2DInputs {
    /* eslint-disable @typescript-eslint/no-redundant-type-constituents */

    /**
     * @description Unit system (imperial or metric) or specific unit used for area values.
     */
    areaUnit?: "metric" | "imperial" | "square-inches" | "square-feet" | "square-us-feet" | "square-yards" | "square-miles" | "square-meters" | "square-kilometers" | "acres" | "ares" | "hectares" | string;

    /* eslint-enable @typescript-eslint/no-redundant-type-constituents */
}

interface CreateAreaMeasurementOutputs {
    /**
     * @description The area of the measurement polygon in square meters.
     */
    area?: number;
    /**
     * @description The perimeter of the measurement polygon in meters.
     */
    perimeter?: number;

    geometry?: __esri.Polygon;
}

/**
 * @category ArcGIS Maps SDK for JavaScript
 * @clientOnly
 * @defaultName measure
 * @description Measure an area on a 2D map.
 * @helpUrl https://developers.arcgis.com/javascript/latest/sample-code/widgets-measurement-2d
 * @supportedApps EXB, GWV
 */
@activate(MapProvider)
export default class CreateAreaMeasurement2D implements IActivityHandler {
    async execute(
        inputs: CreateAreaMeasurement2DInputs,
        context: IActivityContext,
        type: typeof MapProvider
    ): Promise<CreateAreaMeasurementOutputs> {
        const { areaUnit } = inputs;
        const mapProvider = type.create();
        await mapProvider.load();
        if (!mapProvider.map) {
            throw new Error("map is required");
        }
        const mapView = mapProvider.view as MapView;
        let watchHandle: __esri.WatchHandle | undefined;
        /** 
         * Ideally this would be implemented using AreaMeasurement2DViewModel or DistanceMeasurement2DViewModel
         * but there is an inconsistency in the Esri Widget View Model pattern with 
         * measurements that forces the creation of a widget.  A standalone view model 
         * does not initialize.
         **/
        const measurementWidget = new AreaMeasurement2D({
            view: mapView,
            unit: areaUnit as any,
        });

        measurementWidget.viewModel.start();
        const measurement: __esri.AreaMeasurement2DViewModelMeasurement | undefined
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
        }
    }
}