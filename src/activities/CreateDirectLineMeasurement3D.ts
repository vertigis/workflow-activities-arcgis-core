/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
    IActivityHandler,
    IActivityContext,
} from "@geocortex/workflow/runtime/IActivityHandler";
import { MapProvider } from "@geocortex/workflow/runtime/activities/arcgis/MapProvider";
import { activate } from "@geocortex/workflow/runtime/Hooks";
import DirectLineMeasurement3D from "@arcgis/core/widgets/DirectLineMeasurement3D";
import SceneView from "@arcgis/core/views/SceneView";
type removeFunction = () => void;
type linearMeasurementUnits = "metric" | "imperial" | "inches" | "feet" | "us-feet" | "yards" | "miles" | "nautical-miles" | "meters" | "kilometers";
type DirectLineMeasurement3DResult = {
    measurementMode: "euclidean" | "geodesic";
    directDistance: {
        text: string;
        state: string;
    };
    horizontalDistance: {
        text: string;
        state: string;
    };
    verticalDistance: {
        text: string;
        state: string;
    };
}

/** An interface that defines the inputs of the activity. */
interface CreateDirectLineMeasurement3DInputs {
    /**
     * @description Unit system (imperial or metric) or specific unit used for distance values.
     */
    linearUnit?: linearMeasurementUnits | string;

}

interface CreateDirectLineMeasurement3DOutputs {

    measurement?: DirectLineMeasurement3DResult;
    /**
     * @description Function that removes the measurement from the map.
     */
    remove?: removeFunction;

}

/**
 * @category ArcGIS Maps SDK for JavaScript
 * @clientOnly
 * @defaultName measure
 * @description Measure a distance on a 3D map.
 * @helpUrl https://developers.arcgis.com/javascript/latest/sample-code/widgets-measurement-3d
 * @supportedApps EXB, GWV
 */
@activate(MapProvider)
export default class CreateDirectLineMeasurement3D implements IActivityHandler {
    async execute(inputs: CreateDirectLineMeasurement3DInputs,
        context: IActivityContext,
        type: typeof MapProvider): Promise<CreateDirectLineMeasurement3DOutputs> {
        const { linearUnit } = inputs;
        const mapProvider = type.create();
        await mapProvider.load();
        if (!mapProvider.view) {
            throw new Error("map view is required");
        }
        const mapView = mapProvider.view as SceneView;
        let keyDown: ((event: KeyboardEvent) => void) | undefined;
        let measurement: DirectLineMeasurement3DResult | undefined;
        /**
         * Ideally this would be implemented using AreaMeasurement3DViewModel or DirectLineMeasurement3DViewModel
         * but there is an inconsistency in the Esri Widget View Model pattern with 
         * measurements that forces the creation of a widget.  A standalone view model 
         * does not initialize.
         **/
        const measurementWidget = new DirectLineMeasurement3D({
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
