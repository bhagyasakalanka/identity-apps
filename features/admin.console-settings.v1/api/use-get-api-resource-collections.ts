/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com).
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

import useRequest, {
    RequestConfigInterface,
    RequestErrorInterface,
    RequestResultInterface
} from "@wso2is/admin.core.v1/hooks/use-request";
import { HttpMethods } from "@wso2is/core/models";
import { getConsoleSettingsResourceEndpoints } from "../configs/endpoints";
import { APIResourceCollectionResponseInterface } from "../models/console-roles";

/**
 * Hook to get the API resource collections.
 *
 * @param shouldFetch - Should fetch the data.
 * @param filter - Search filter.
 * @param attributes - Required additional attributes.
 * @returns SWR response object containing the data, error, isValidating, mutate.
 */
const useGetAPIResourceCollections = <
    Data = APIResourceCollectionResponseInterface,
    Error = RequestErrorInterface>(
        shouldFetch: boolean = true,
        filter?: string,
        attributes?: string
    ): RequestResultInterface<Data, Error> => {
    const requestConfig: RequestConfigInterface = {
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        },
        method: HttpMethods.GET,
        params: {
            attributes,
            filter
        },
        url: getConsoleSettingsResourceEndpoints().apiResourceCollections
    };

    const { data, error, isValidating, mutate } = useRequest<Data, Error>(shouldFetch? requestConfig : null, {
        shouldRetryOnError: false
    });

    return {
        data,
        error,
        isLoading: !error && !data,
        isValidating,
        mutate
    };
};

export default useGetAPIResourceCollections;
