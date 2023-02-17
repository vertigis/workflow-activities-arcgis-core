/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
    IActivityHandler,
    IActivityContext,
} from "@geocortex/workflow/runtime/IActivityHandler";
import { MapProvider } from "@geocortex/workflow/runtime/activities/arcgis/MapProvider";
import { activate } from "@geocortex/workflow/runtime/Hooks";
import DirectLineMeasurement3D from "@arcgis/core/widgets/DirectLineMeasurement3D";
import AreaMeasurement3D from "@arcgis/core/widgets/AreaMeasurement3D";
import SceneView from "@arcgis/core/views/SceneView";

/** An interface that defines the inputs of the activity. */
interface CreateMeasurement3DInputs {
    /**
     * @description The type of measurement.
     * @required
     */
    measurementType?: "area" | "direct-line" | string;

    /**
     * @description Unit system (imperial or metric) or specific unit used for area values.
     */
    areaUnit?: "metric" | "imperial" | "square-inches" | "square-feet" | "square-us-feet" | "square-yards" | "square-miles" | "square-meters" | "square-kilometers" | "acres" | "ares" | "hectares" | string | undefined;

    /**
     * @description Unit system (imperial or metric) or specific unit used for distance values.
     */
    linearUnit?: "metric" | "imperial" | "inches" | "feet" | "us-feet" | "yards" | "miles" | "nautical-miles" | "meters" | "kilometers" | string | undefined;

}

interface CreateMeasurement3DOutputs {

    measurement: __esri.AreaMeasurement3DViewModelMeasurement | __esri.DirectLineMeasurement3DViewModelMeasurement | undefined;
    measurementWidget: any,

}

/**
 * @category ArcGIS Maps SDK for JavaScript
 * @clientOnly
 * @description Measure a distance or area on a 3D map.
 * @helpUrl https://developers.arcgis.com/javascript/latest/sample-code/widgets-measurement-3d
 * @supportedApps EXB, GWV
 */
@activate(MapProvider)
export default class CreateMeasurement3D implements IActivityHandler {
    async execute(inputs: CreateMeasurement3DInputs,
        context: IActivityContext,
        type: typeof MapProvider): Promise<CreateMeasurement3DOutputs> {
        const { linearUnit, measurementType, areaUnit } = inputs;
        const areaUnits = ["metric", "imperial", "square-inches", "square-feet", "square-us-feet", "square-yards", "square-miles", "square-meters", "square-kilometers", "acres", "ares", "hectares"]
        const linearUnits = ["metric", "imperial", "inches", "feet", "us-feet", "yards", "miles", "nautical-miles", "meters", "kilometers"]
        const mapProvider = type.create();
        await mapProvider.load();
        if (!mapProvider.view) {
            throw new Error("map view is required");
        }
        if (!measurementType) {
            throw new Error("measurementType is required");
        }
        if (["area", "direct-line"].indexOf(measurementType) == -1) {
            throw new Error(`measurementType not supported: ${measurementType}`);
        }
        if (linearUnit && linearUnits.indexOf(linearUnit) == -1) {
            throw new Error(`linear unit not supported: ${linearUnit}`);
        }
        if (areaUnit && areaUnits.indexOf(areaUnit) == -1) {
            throw new Error(`area unit not supported: ${areaUnit}`);
        }
        const mapView = mapProvider.view as SceneView;

        /**
         * Ideally this would be implemented using AreaMeasurement3DViewModel or DirectLineMeasurement3DViewModel
         * but there is an inconsistency in the Esri Widget View Model pattern with 
         * measurements that forces the creation of a widget.  A standalone view model 
         * does not initialize.
         **/        
        let measurementWidget;

        switch (measurementType) {
            case "area":
                measurementWidget = new AreaMeasurement3D({
                    view: mapView,
                    unit: areaUnit as any,
                });
                break;
            case "distance":
            default:
                measurementWidget = new DirectLineMeasurement3D({
                    view: mapView,
                    unit: linearUnit as any,

                });
                break;
        }

        measurementWidget.viewModel.start();
        const measurement: __esri.AreaMeasurement3DViewModelMeasurement | __esri.DirectLineMeasurement3DViewModelMeasurement | undefined
            = await new Promise((resolve) => {
                measurementWidget.watch("viewModel.state", function (state: string) {
                    if (state === "measured") {
                        resolve(measurementWidget.viewModel.measurement);
                    }
                });

            });
        return {
            measurement,
            measurementWidget,
        };
    }
}
