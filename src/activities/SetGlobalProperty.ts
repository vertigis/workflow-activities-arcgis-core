import type { IActivityHandler } from "@geocortex/workflow/runtime";
import config from "@arcgis/core/config";

interface SetGlobalPropertyInputs {
    /**
     * @description The name of the global property to modify.
     * @required
     * @noExpressions
     */
    name:
        | "apiKey"
        | "fontsUrl"
        | "geoRSSServiceUrl"
        | "geometryServiceUrl"
        | "kmlServiceUrl"
        | "routeServiceUrl";

    /**
     * @description The value to apply to the property.
     * @required
     */
    value: string;
}

interface SetGlobalPropertyOutputs {}

/**
 * @category ArcGIS Maps SDK for JavaScript
 * @clientOnly
 * @description Configure global properties of the ArcGIS Maps SDK for JavaScript library.
 * @helpUrl https://developers.arcgis.com/javascript/latest/api-reference/esri-config.html
 * @supportedApps EXB, GWV
 */
export default class SetGlobalProperty implements IActivityHandler {
    execute(inputs: SetGlobalPropertyInputs): SetGlobalPropertyOutputs {
        const { name, value } = inputs;
        if (!name) {
            throw new Error("name is required");
        }

        // Ensure the name input only includes a subset of config properties
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        const prop = name as keyof Pick<
            config,
            SetGlobalPropertyInputs["name"]
        >;

        switch (prop) {
            case "apiKey":
            case "fontsUrl":
            case "kmlServiceUrl":
            case "geoRSSServiceUrl":
            case "geometryServiceUrl":
            case "routeServiceUrl":
                config[name] = value;
                break;
            default:
                prop satisfies never;
                throw new Error(`The property '${name}' is not supported`);
        }

        return {};
    }
}
