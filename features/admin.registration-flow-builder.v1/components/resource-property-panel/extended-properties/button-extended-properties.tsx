/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com).
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

import Avatar from "@oxygen-ui/react/Avatar";
import Box from "@oxygen-ui/react/Box";
import Card from "@oxygen-ui/react/Card";
import CardContent from "@oxygen-ui/react/CardContent";
import Divider from "@oxygen-ui/react/Divider";
import Grid from "@oxygen-ui/react/Grid";
import Stack from "@oxygen-ui/react/Stack";
import Typography from "@oxygen-ui/react/Typography";
import { CommonResourcePropertiesPropsInterface } from "@wso2is/admin.flow-builder-core.v1/components/resource-property-panel/resource-properties";
// eslint-disable-next-line max-len
import useAuthenticationFlowBuilderCore from "@wso2is/admin.flow-builder-core.v1/hooks/use-authentication-flow-builder-core-context";
import { IdentifiableComponentInterface } from "@wso2is/core/models";
import classNames from "classnames";
import isEqual from "lodash-es/isEqual";
import React, { FunctionComponent, ReactElement } from "react";
import useGetRegistrationFlowCoreActions from "../../../api/use-get-registration-flow-builder-actions";
import "./button-extended-properties.scss";
import omit from "lodash-es/omit";
import { Element } from "@wso2is/admin.flow-builder-core.v1/models/elements";
import { ActionTypes } from "@wso2is/admin.flow-builder-core.v1/models/actions";

/**
 * Props interface of {@link ButtonExtendedProperties}
 */
export type ButtonExtendedPropertiesPropsInterface = CommonResourcePropertiesPropsInterface &
    IdentifiableComponentInterface;

/**
 * Extended properties for the field elements.
 *
 * @param props - Props injected to the component.
 * @returns The ButtonExtendedProperties component.
 */
const ButtonExtendedProperties: FunctionComponent<ButtonExtendedPropertiesPropsInterface> = ({
    "data-componentid": componentId = "button-extended-properties",
    resource,
    onChange,
    onVariantChange
}: ButtonExtendedPropertiesPropsInterface): ReactElement => {
    const { data: actions } = useGetRegistrationFlowCoreActions();
    const { lastInteractedResource, setLastInteractedResource } = useAuthenticationFlowBuilderCore();

    return (
        <Stack className="button-extended-properties" gap={ 2 } data-componentid={ componentId }>
            <div>
                <Typography className="button-extended-properties-heading">Type</Typography>
                { actions?.map((action: Element & { types: Element[] }, index: number) => (
                    <Box key={ index }>
                        <Typography className="button-extended-properties-sub-heading" variant="body1">
                            { action?.display?.label }
                        </Typography>
                        <Grid container spacing={ 1 }>
                            { action.types?.map((actionType: Element, typeIndex: number) => (
                                <Grid
                                    key={ typeIndex }
                                    xs={ 6 }
                                    onClick={ () => {
                                        onVariantChange(actionType?.display?.defaultVariant);

                                        onChange("action", actionType, resource);

                                        setLastInteractedResource({
                                            ...lastInteractedResource,
                                            action: actionType,
                                            variant: actionType?.display?.defaultVariant
                                        });
                                    } }
                                >
                                    <Card
                                        className={ classNames("extended-property action-type", {
                                            selected:
                                                isEqual(
                                                    omit((resource as Element)?.action, "next"),
                                                    actionType.action
                                                ) ||
                                                (actionType.type === ActionTypes.Next &&
                                                    actionType.type === (resource as Element)?.action?.type)
                                        }) }
                                        variant="outlined"
                                    >
                                        <CardContent>
                                            <Box display="flex" flexDirection="row" gap={ 1 } alignItems="center">
                                                <Avatar
                                                    className="action-type-icon"
                                                    src={ actionType?.display?.image }
                                                    variant="rounded"
                                                />
                                                <Typography variant="body2" className="action-type-name">
                                                    { actionType?.display?.label }
                                                </Typography>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            )) }
                        </Grid>
                    </Box>
                )) }
            </div>
            <Divider />
        </Stack>
    );
};

export default ButtonExtendedProperties;
