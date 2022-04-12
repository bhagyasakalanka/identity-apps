/**
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
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

 import { AsgardeoSPAClient } from "@asgardeo/auth-react";
 import { HttpMethods } from "@wso2is/core/models";
 import { SCIMConfigs } from "../extensions/configs/scim";
 import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
 import { IdentityAppsApiException } from "@wso2is/core/exceptions";
 import { ProfileConstants } from "../constants";
 import { store } from "../store";
 
/**
 * Get an axios instance.
 *
 * @type {AxiosHttpClientInstance}
 */
 const httpClient = AsgardeoSPAClient.getInstance().httpRequest.bind(AsgardeoSPAClient.getInstance());

/**
 * This API is used to check if the TOTP secret key is added for the user
 */
 export const getEnabledAuthenticators = (): Promise<any> => {
    const requestConfig = {
        headers: {
            "Access-Control-Allow-Origin": store.getState().config.deployment.clientHost,
            "Content-Type": "application/json"
        },
        method: HttpMethods.GET,
        url: store.getState().config.endpoints.me
    };

    return httpClient(requestConfig)
        .then((response) => {
            if (response.status !== 200) {
                return Promise.reject(`An error occurred. The server returned ${response.status}`);
            }
            const enabledAuthenticators = response?.["data"]?.[SCIMConfigs.scim.customEnterpriseSchema]?.["enabledAuthenticators"];

           return enabledAuthenticators;
        })
        .catch((error) => {
            return Promise.reject(error);
        });
};

export const updateEnabledAuthenticators = (enabledAuthenticators: string): Promise<AxiosResponse> => {

    // If the `httpRequest` method from SDK is used for the request, it causes the 401 to be handled by
    // the callbacks set fot the application which will log the user out. Hence, axios will be used
    // for now to send the request since bearer token is not used for authorization we can get away with axios.
    // TODO: Implement a method in `AsgardeoSPAClient` http module to disable/enable the handler.
    // See https://github.com/asgardio/asgardio-js-oidc-sdk/issues/45 for progress.
    // httpRequest.disableHandler();

    console.log("state",store.getState().config.deployment.clientHost)
    const requestConfig: AxiosRequestConfig = {
        headers: {
            "Access-Control-Allow-Origin": store.getState()?.config?.deployment?.clientHost,
            "Content-Type": "application/json"
        },
        data: {
            Operations: [
                {
                    op: "replace",
                    value: {
                        "urn:scim:wso2:schema": {enabledAuthenticators: enabledAuthenticators}
                    }
                }  
            ],
            schemas: [ "urn:ietf:params:scim:api:messages:2.0:PatchOp" ]
        },
        method: HttpMethods.PATCH,
        url: store.getState().config.endpoints.me
    };

    return httpClient(requestConfig)
        .then((response) => {
            if (response.status !== 200) {
                return Promise.reject(
                    new Error(`Failed to enabled TOTP authenticator: ${store.getState().config.endpoints.me}`)
                );
            }
            return Promise.resolve(response);
        })
        .catch((error) => {
            return Promise.reject(error?.response?.data);
        });        
};

/**
 * This API is used to check if the TOTP secret key is added for the user
 */
 export const isMFAAuthenticatorEnabled = (claimID : string): Promise<any> => {
    const requestConfig = {
        headers: {
            "Access-Control-Allow-Origin": store.getState().config.deployment.clientHost,
            "Content-Type": "application/json"
        },
        method: HttpMethods.GET,
        url: store.getState().config.endpoints.me
    };

    return httpClient(requestConfig)
        .then((response) => {
            if (response.status !== 200) {
                return Promise.reject(`An error occurred. The server returned ${response.status}`);
            }
            const isEnabled = response?.["data"]?.[SCIMConfigs.scim.customEnterpriseSchema]?.[claimID];

            if (isEnabled && isEnabled == "true") {
                return true;
            } else {
                return false;
            }
        })
        .catch((error) => {
            return Promise.reject(error);
        });
};
