import Portal from "@arcgis/core/portal/Portal";
import type { IActivityHandler } from "@vertigis/workflow";

interface GetPortalOutputs {
    /**
     * @description The default portal instance.
     */
    portal: __esri.Portal;
}

/**
 * @category ArcGIS Maps SDK for JavaScript
 * @clientOnly
 * @defaultName portal
 * @description Gets the default Portal instance.
 * @helpUrl https://developers.arcgis.com/javascript/latest/api-reference/esri-portal-Portal.html#getDefault
 * @supportedApps EXB, GWV
 */
export default class GetPortal implements IActivityHandler {
    execute(): GetPortalOutputs {
        return {
            portal: Portal.getDefault(),
        };
    }
}
