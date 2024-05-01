import type { IActivityHandler } from "@vertigis/workflow";
import request from "@arcgis/core/request";

interface SendRequestInputs {
    /* eslint-disable @typescript-eslint/no-redundant-type-constituents */

    /**
     * @displayName URL
     * @description The request URL.
     * @required
     */
    url: string;
    /**
     * @description Indicates if and how requests to ArcGIS Services are authenticated.
     */
    authMode?: "auto" | "anonymous" | "immediate" | "no-prompt" | string;
    /**
     * @description If uploading a file, specify the form data or element used to submit the file here.
     */
    body?: FormData | HTMLFormElement | string;
    /**
     * @description If `true`, the browser will send a request to the server instead of using the browser's local cache.
     */
    cacheBust?: boolean;
    /**
     * @description Headers to use for the request.
     */
    headers?: any;
    /**
     * @description Indicates if the request should be made using the HTTP DELETE, HEAD, POST, or PUT method.
     */
    method?: "auto" | "delete" | "head" | "post" | "put" | string;
    /**
     * @description Query parameters for the request.
     */
    query?: any;
    /**
     * @description Response format.
     */
    responseType?: "json" | "text" | "array-buffer" | "blob" | "image" | "native" | "document" | "xml" | string;
    /**
     * @description AbortSignal allows for cancelable requests.
     */
    signal?: AbortSignal;
    /**
     * @description Indicates the amount of time in milliseconds to wait for a response from the server.
     */
    timeout?: number;
    /**
     * @description Indicates the request should use the proxy.
     */
    useProxy?: boolean;
    /**
     * @description Indicates if cross-site `Access-Control` requests should use credentials.
     */
    withCredentials?: boolean;
    
    /* eslint-enable @typescript-eslint/no-redundant-type-constituents */
}

interface SendRequestOutputs {
    /**
     * @description The response of the request.
     */
    response: {
        /**
         * The requested data.
         */
        data?: any;
        /**
         * The options specified by the user in the data request.
         */
        requestOptions?: any;
        /**
         * Indicates if the request required https.
         */
        ssl?: boolean;
        /**
         * The URL used to request the data.
         */
        url?: string;
        /**
         * Method for getting a header sent from the server.
         */
        getHeader?: (headerName: string) => string;
    };
}

// Interface to attempt to maintain some type safety while allowing string unions to also accept string variables
interface Options extends Omit<__esri.RequestOptions, "authMode" | "method" | "responseType"> {
    authMode?: string;
    method?: string;
    responseType?: string;
}

/**
 * @category ArcGIS Maps SDK for JavaScript
 * @displayName Send ArcGIS Request
 * @clientOnly
 * @description Retrieves data from a remote server or uploads a file from a user's computer.
 * @helpUrl https://developers.arcgis.com/javascript/latest/api-reference/esri-request.html#esriRequest
 * @supportedApps EXB, GWV
 */
export default class SendRequest implements IActivityHandler {
    async execute(inputs: SendRequestInputs): Promise<SendRequestOutputs> {
        const { url, ...other } = inputs;
        if (!url) {
            throw new Error("url is required");
        }

        const options: Options = other;

        const response = await request(url, options as __esri.RequestOptions);

        return {
            response,
        };
    }
}
