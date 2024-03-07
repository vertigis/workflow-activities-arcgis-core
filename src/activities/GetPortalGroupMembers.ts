import type { IActivityHandler } from "@geocortex/workflow/runtime";

interface GroupMembers {
    admins: string[];
    owner: string;
    users: string[];
}

interface GetPortalGroupMembersInputs {
    /**
     * @description The group to get the members of.
     * @required
     */
    group?: __esri.PortalGroup;
}

interface GetPortalGroupMembersOutputs {
    /**
     * @description An array containing the user names for each user in the group.
     */
    users: string[];

    /**
     * @description An array containing the user names for each administrator of the group.
     */
    admins: string[];

    /**
     * @description The user name of the owner of the group.
     */
    owner: string;

    /**
     * @description An array containing the user names for all administrators and users of the group.
     */
    all: string[];
}

/**
 * @category ArcGIS Maps SDK for JavaScript
 * @clientOnly
 * @defaultName groupMembers
 * @description Fetches the current members of the group. This is only available to members or administrators of the group.
 * @helpUrl https://developers.arcgis.com/javascript/latest/api-reference/esri-portal-PortalGroup.html#fetchMembers
 * @supportedApps EXB, GWV
 */
export default class GetPortalGroupMembers implements IActivityHandler {
    async execute(
        inputs: GetPortalGroupMembersInputs
    ): Promise<GetPortalGroupMembersOutputs> {
        const { group } = inputs;
        if (!group) {
            throw new Error("group is required");
        }

        const result = (await group.fetchMembers()) as GroupMembers;
        const all = Array.from(
            new Set([...result.admins, ...result.users])
        ).sort();

        return {
            ...result,
            all,
        };
    }
}
