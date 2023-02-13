import type { IActivityHandler } from "@geocortex/workflow/runtime";
import Widget from "@arcgis/core/widgets/Widget";

interface RemoveMeasurementInputs {
    /**
     * @description The measurement widget returned by a CreateMeasurement2D activity.
     * @required
     */
    measurementWidget?: Widget;

}

interface RemoveMeasurementOutputs {}
    
    
/**
 * @category ArcGIS Maps SDK for JavaScript
 * @clientOnly
 * @description Remove a measurement that was added to the map.
 * @helpUrl https://developers.arcgis.com/javascript/latest/sample-code/widgets-measurement-2d
 * @supportedApps EXB, GWV
 */
export default class RemoveMeasurement implements IActivityHandler {
    execute(inputs: RemoveMeasurementInputs): RemoveMeasurementOutputs {
        const {measurementWidget} = inputs;
        if(!measurementWidget){
            throw new Error("measurementWidget is required");

        }
        measurementWidget.destroy();
        return {};
    }
}
