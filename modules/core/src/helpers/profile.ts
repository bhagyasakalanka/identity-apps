/**
 * Copyright (c) 2020-2025, WSO2 LLC. (https://www.wso2.com).
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import isEmpty from "lodash-es/isEmpty";
import { AuthReducerStateInterface, MultiValueAttributeInterface, ProfileInfoInterface } from "../models";
import { StringUtils } from "../utils";

/**
 * Resolves the user's display name.
 *
 * @param profileInfo - Profile information.
 * @param authState - Contains basic profile info extracted from the ID token.
 * @param fallback - Fallback value.
 * @returns Resolved display name.
 */
export const resolveUserDisplayName = (
    profileInfo: ProfileInfoInterface,
    authState?: AuthReducerStateInterface,
    fallback: string = null
): string => {

    if (profileInfo.name && (profileInfo.name.givenName || profileInfo.name.familyName)) {
        const givenName: string = isEmpty(profileInfo.name.givenName) ? "" : profileInfo.name.givenName + " ";
        const familyName: string = isEmpty(profileInfo.name.familyName) ? "" : profileInfo.name.familyName;

        return givenName + familyName;
    } else if (profileInfo.userName) {
        return getUserNameWithoutDomain(profileInfo.userName);
    } else if (authState && authState.displayName) {
        return authState.displayName;
    } else if (authState && authState.username) {
        return getUserNameWithoutDomain(authState.username);
    }

    return fallback;
};

/**
 * Same username can exist in two different user stores. This function
 * will resolve the username so that the `PRIMARY` user store users will
 * have just the username and the other user store users will have their
 * corresponding user store prefixed to their username.
 *
 * @param username - Username of the user.
 * @param userStoreDomain - User store domain of the user.
 * @param primaryUserStoreDomainName - Domain name of the primary user store.
 * @returns resolved username
 */
export const resolveUsername = (
    username: string,
    userStoreDomain: string,
    primaryUserStoreDomainName: string
): string => {

    // check if the user store is primary.
    if (StringUtils.isEqualCaseInsensitive(userStoreDomain, primaryUserStoreDomainName)) {
        return username;
    }

    return `${userStoreDomain}/${username}`;
};

/**
 * Resolves the user's username when the user store is embedded
 * in it. `PRIMARY` user store users will have just the username
 * and the other user store users will have their corresponding
 * user store prefixed to their username.
 *
 * @param username - Username of the user with user store embedded.
 * @param primaryUserStoreDomainName - Domain name of the primary user store.
 * @returns resolved user store embedded username
 */
export const resolveUserStoreEmbeddedUsername = (username: string, primaryUserStoreDomainName: string): string => {

    const parts: string[] = username.split("/");

    if (parts.length === 1) {
        return username;
    }

    // check if the user store is primary.
    if (StringUtils.isEqualCaseInsensitive(parts[0], primaryUserStoreDomainName)) {
        return parts[1];
    }

    return username;
};

/**
 * Get the user's emails as a string array.
 *
 * @param emails - User emails.
 * @returns Emails as a string array.
 */
export const resolveUserEmails = (emails: (string | MultiValueAttributeInterface)[]): string[] => {
    if (!emails || !Array.isArray(emails) || emails.length < 1) {
        return [];
    }

    return emails.map((email: (string | MultiValueAttributeInterface)): string => {
        if (typeof email !== "string" && email?.value) {
            return email.value;
        }

        return email as string;
    });
};

/**
 * This function returns the username without the user store domain prefix.
 *
 * @param userNameWithDomain - Username of the user with the userStore domain.
 * @returns User name without domain.
 */
export const getUserNameWithoutDomain = (userNameWithDomain: string): string => {

    if (userNameWithDomain.indexOf("/") > -1) {
        const fragments: string[] = userNameWithDomain.split("/");

        if (fragments?.length > 1) {
            return fragments[1];
        }
    }

    return userNameWithDomain;
};

/**
 * Get the user's userstore as a string.
 *
 * @param username - Username.
 * @param primaryUserStoreDomainName - Domain name of the primary user store.
 * @returns Userstore as a string.
 */
export const resolveUserstore = (username: string, primaryUserStoreDomainName: string): string => {

    const userNameSegments: string[] = username.split("/");

    if (userNameSegments.length > 1) {
        return userNameSegments[0];
    } else {
        return primaryUserStoreDomainName;
    }
};
