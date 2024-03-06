import Portal from "@arcgis/core/portal/Portal";
import type { IActivityHandler } from "@geocortex/workflow/runtime";

interface QueryPortalGroupsInputs {
    /**
     * @description The query string used for the search.
     */
    query?: string;

    /**
     * @description Structured filter to use instead of the query property. For example, owner:"jsmith".
     */
    filter?: string;

    /**
     * @description An array of categories stored within the group.
     */
    categories?: (string | string[])[];

    /**
     * @description A comma-delimited list of fields to sort.
     */
    sortField?: "title" | "created" | "owner" | string;

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
}

interface QueryPortalGroupsOutputs {
    /**
     * @description The result portal groups that match the input query.
     */
    results: __esri.PortalGroup[];

    /**
     * @description The total number of results that match the query. It is counted accurately up to 10,000; if the total number is greater than this value, 10,000 will be returned.
     */
    total: number;
}

/**
 * @category ArcGIS Maps SDK for JavaScript
 * @clientOnly
 * @defaultName portalGroups
 * @description Executes a query against the Portal to return an array of PortalGroup objects that match the input query.
 * @helpUrl https://developers.arcgis.com/javascript/latest/api-reference/esri-portal-Portal.html#queryGroups
 * @supportedApps EXB, GWV
 */
export default class QueryPortalGroups implements IActivityHandler {
    async execute(
        inputs: QueryPortalGroupsInputs
    ): Promise<QueryPortalGroupsOutputs> {
        const { categories, filter, num, query, sortOrder, sortField, start } =
            inputs;
        const portal = Portal.getDefault();

        const result = await portal.queryGroups({
            categories,
            filter,
            num,
            query,
            sortOrder: sortOrder as Exclude<
                QueryPortalGroupsInputs["sortOrder"],
                string
            >,
            sortField: sortField as Exclude<
                QueryPortalGroupsInputs["sortField"],
                string
            >,
            start,
        });

        return {
            total: result.total,
            results: result.results,
        };
    }
}
