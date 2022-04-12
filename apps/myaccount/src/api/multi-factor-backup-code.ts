/**
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
  * The action types of the totp post endpoint
  */
 enum PostBackupCodeActions {
     INIT = "INIT",
     REFRESH = "REFRESH"
 }
 
 /**
  * Refresh TOTP secret key of the authenticated user
  */
 export const refreshBackupCode = (): Promise<any> => {
     console.log("refresh backup code")
     const requestConfig = {
         data: {
             action: PostBackupCodeActions.REFRESH
         },
         headers: {
             "Access-Control-Allow-Origin": store.getState()?.config?.deployment?.clientHost,
             "Content-Type": "application/json"
         },
         method: HttpMethods.POST,
         url: store.getState().config.endpoints.backupCode
     };
 
     return httpClient(requestConfig)
         .then((response) => {
             if (response.status !== 200) {
                 return Promise.reject(`An error occurred. The server returned ${response.status}`);
             } else {
                 return Promise.resolve(response);
             }
         })
         .catch((error) => {
             return Promise.reject(error);
         });
 };
 
 /**
  * Generate TOTP QR code URL for the authenticated user
  */
 export const initBackupCode = (): Promise<any> => {
     
     const requestConfig = {
         data: {
             action: PostBackupCodeActions.INIT
         },
         headers: {
             "Access-Control-Allow-Origin": store.getState()?.config?.deployment?.clientHost,
             "Content-Type": "application/json"
         },
         method: HttpMethods.POST,
         url: store.getState().config.endpoints.backupCode
     };
 
     return httpClient(requestConfig)
         .then((response) => {
             if (response.status !== 200) {
                 console.log("get a response.........", response)
                 return Promise.reject(`An error occurred. The server returned ${response.status}`);
             }
             console.log("get a response haha.........", response)
             return Promise.resolve(response);
         })
         .catch((error) => {
             console.log("get a error", error)
             return Promise.reject(error);
         });
 };
 
 /**
  * This API is used to delete the TOTP credentials of the authenticated user.
  */
 export const deleteBackupCode = (): Promise<any> => {
     const requestConfig = {
         headers: {
             "Access-Control-Allow-Origin": store.getState()?.config?.deployment?.clientHost,
             "Content-Type": "application/json"
         },
         method: HttpMethods.DELETE,
         url: store.getState().config.endpoints.backupCode
     };
 
     return httpClient(requestConfig)
         .then((response) => {
             if (response.status !== 200) {
                 return Promise.reject(`An error occurred. The server returned ${response.status}`);
             }
 
             return Promise.resolve(response);
         })
         .catch((error) => {
             return Promise.reject(error);
         });
 };
 
 /**
  * This API is used to retrieve the TOTP secret of the authenticated user.
  */
 export const getBackupCodes = (): Promise<any> => {
     const requestConfig = {
         headers: {
             "Access-Control-Allow-Origin": store.getState()?.config?.deployment?.clientHost,
             "Content-Type": "application/json"
         },
         method: HttpMethods.GET,
         url: store.getState().config.endpoints.backupCode
     };
 
     return httpClient(requestConfig)
         .then((response) => {
             if (response.status !== 200) {
                 return Promise.reject(`An error occurred. The server returned ${response.status}`);
             }
 
             return Promise.resolve(response);
         })
         .catch((error) => {
             return Promise.reject(error);
         });
 };

 
 export const disableBackupAuthenticator = (): Promise<AxiosResponse> => {

    console.log("state",store.getState().config.deployment.clientHost)
    const requestConfig: AxiosRequestConfig = {
        headers: {
            "Access-Control-Allow-Origin": store.getState()?.config?.deployment?.clientHost,
            "Content-Type": "application/json"
        },
        method: HttpMethods.PATCH,
        url: store.getState().config.endpoints.backupCodeDisable
    };

    return httpClient(requestConfig)
        .then((response) => {
            if (response.status !== 200) {
                return Promise.reject(
                    new Error(`Failed to disable Backup code authenticator: ${store.getState().config.endpoints.backupCodeDisable}`)
                );
            }
            return Promise.resolve(response);
        })
        .catch((error) => {
            return Promise.reject(error?.response?.data);
        });        
};
