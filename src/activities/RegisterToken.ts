import type { IActivityHandler } from "@vertigis/workflow";
import IdentityManager from "@arcgis/core/identity/IdentityManager";

interface RegisterTokenInputs {
    /**
     * @description The URL of the server that the access token is valid for. For example: https://www.arcgis.com/sharing/rest; https://www.example.com/portal/sharing/rest; https://www.example.com/arcgis/rest/services.
     * @required
     */
    server: string;

    /**
     * @description The access token.
     * @required
     */
    token: string;

    /**
     * @description The token expiration time specified as number of milliseconds since 1 January 1970 00:00:00 UTC.
     */
    expires?: number;
}

interface RegisterTokenOutputs {}

/**
 * @category ArcGIS Maps SDK for JavaScript
 * @clientOnly
 * @description Registers an OAuth 2.0 access token or ArcGIS Server token with the IdentityManager.
 * @helpUrl https://developers.arcgis.com/javascript/latest/api-reference/esri-identity-IdentityManager.html#registerToken
 * @supportedApps EXB, GWV
 */
export default class RegisterToken implements IActivityHandler {
    execute(inputs: RegisterTokenInputs): RegisterTokenOutputs {
        const { expires, server, token } = inputs;
        if (!server) {
            throw new Error("server is required");
        }
        if (!/^https:\/\//.test(server)) {
            throw new Error("server must use the https:// protocol");
        }
        if (!token) {
            throw new Error("token is required");
        }

        IdentityManager.registerToken({
            expires,
            server,
            token,
        });

        return {};
    }
}
