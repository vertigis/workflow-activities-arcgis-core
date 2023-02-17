/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
    IActivityHandler,
    IActivityContext,
} from "@geocortex/workflow/runtime/IActivityHandler";
import { MapProvider } from "@geocortex/workflow/runtime/activities/arcgis/MapProvider";
import { activate } from "@geocortex/workflow/runtime/Hooks";
import AreaMeasurement2D from "@arcgis/core/widgets/AreaMeasurement2D";
import MapView from "@arcgis/core/views/MapView";
import { removeFunction, linearMeasurementUnits, AreaMeasurement2DResult } from "../types";
export interface CreateAreaMeasurement2DInputs {
    /**
     * @description Unit system (imperial or metric) or specific unit used for area values.
     */
    areaUnit?: linearMeasurementUnits | string;

}

export interface CreateAreaMeasurementOutputs {
    measurement: AreaMeasurement2DResult | undefined;

    /**
     * @description Function that removes the measurement from the map.
     */
    remove: removeFunction | undefined;
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
export default class CreateAreaMeasurement implements IActivityHandler {
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
        let keyDown: ((event: KeyboardEvent) => void) | undefined;
        let measurement: AreaMeasurement2DResult | undefined;

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
