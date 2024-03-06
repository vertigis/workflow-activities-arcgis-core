import Portal from "@arcgis/core/portal/Portal";
import type { IActivityHandler } from "@vertigis/workflow";

interface QueryPortalItemsInputs {
    /**
     * @description The query string used for the search.
     */
    query?: string;

    /**
     * @description Structured filter to use instead of the query property. For example, tags:"public".
     */
    filter?: string;

    /**
     * @description A comma-delimited list of fields to sort.
     */
    sortField?: "title" | "uploaded" | "modified" | "created" | "type" | "owner" | "avg-rating" | "num-ratings" | "num-comments" | "num-views" | string;

    /**
     * @description The order in which to sort the results. The default is "asc".
     */
    sortOrder?: "asc" | "desc" | string;

    /**
     * @displayName Number
     * @description The maximum number of results to be included in the result set response. The default is 10. The maximum value allowed is 100. The start property, along with the number property can be used to paginate the search results.
     */
    num?: number;

    /**
     * @description The index of the first entry in the result set response. The default is 1. The index is 1-based. The start property, along with the number property can be used to paginate the search results.
     */
    start?: number;

    /**
     * @description When specified, restricts the results of the query to the specified extent. The spatial reference of the extent must be WGS84 (4326) or Web Mercator (3857).
     */
    extent?: __esri.Extent;

    /**
     * @description An array of categories stored within the item.
     */
    categories?: (string | string[])[];
}

interface QueryPortalItemsOutputs {
    /**
     * @description The result portal items that match the input query.
     */
    results: __esri.PortalItem[];

    /**
     * @description The total number of results that match the query. It is counted accurately up to 10,000; if the total number is greater than this value, 10,000 will be returned.
     */
    total: number;
}

/**
 * @category ArcGIS Maps SDK for JavaScript
 * @clientOnly
 * @defaultName portalItems
 * @description Executes a query against the Portal to return an array of PortalItem objects that match the input query.
 * @helpUrl https://developers.arcgis.com/javascript/latest/api-reference/esri-portal-Portal.html#queryItems
 * @supportedApps EXB, GWV
 */
export default class QueryPortalItems implements IActivityHandler {
    async execute(inputs: QueryPortalItemsInputs): Promise<QueryPortalItemsOutputs> {
        const { categories, extent, filter, num, query, sortOrder, sortField, start } = inputs;
        const portal = Portal.getDefault();

        const result = await portal.queryItems({
            categories,
            extent,
            filter,
            num,
            query,
            sortOrder: sortOrder as Exclude<QueryPortalItemsInputs["sortOrder"], string>,
            sortField: sortField as Exclude<QueryPortalItemsInputs["sortField"], string>,
            start,
        });

        return {
            total: result.total,
            results: result.results,
        };
    }
}
