/**
 * Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

 import { hasRequiredScopes, isFeatureEnabled } from "@wso2is/core/helpers";
 import { SBACInterface, TestableComponentInterface } from "@wso2is/core/models";
 import React, {useState, useEffect} from "react";
 import { useTranslation } from "react-i18next";
 import { useSelector } from "react-redux";
 import { List, Grid, Button } from "semantic-ui-react";
 import { FIDOAuthenticator, SMSOTPAuthenticator, TOTPAuthenticator } from "./authenticators";
 import { AppConstants } from "../../constants";
 import { AlertInterface, FeatureConfigInterface } from "../../models";
 import { AppState } from "../../store";
 import { SettingsSection } from "../shared";
 import {RenderBackupCodeWizard} from "./authenticators"
 import {getEnabledAuthenticators, updateEnabledAuthenticators} from "../../api"
 /**
  * Prop types for the basic details component.
  * Also see {@link MultiFactorAuthentication.defaultProps}
  */
 interface MfaProps extends SBACInterface<FeatureConfigInterface>, TestableComponentInterface {
     onAlertFired: (alert: AlertInterface) => void;
 }
 
 export const MultiFactorAuthentication: React.FunctionComponent<MfaProps> = (props: MfaProps): JSX.Element => {
 
     const {
         onAlertFired,
         featureConfig,
         ["data-testid"]: testId
     } = props;
     const { t } = useTranslation();
 
     const allowedScopes: string = useSelector((state: AppState) => state?.authenticationInformation?.scope);
     const isReadOnlyUser = useSelector((state: AppState) => state.authenticationInformation.profileInfo.isReadOnly);
     const [isBackupCodeDisabled, setIsBackupCodeDisabled] = useState<boolean>(true);
     const isBackupCodeForced: boolean = useSelector((state: AppState) => state?.config?.ui?.features["security"].isBackupCodeForced);
     const tenantDomain = useSelector((state: AppState) => state.authenticationInformation.profileInfo.tenantDomain);
     const [showBackupWizard, setShowBackupWIzard] = useState<boolean>(false)
    
     const [openBackupWizard, setOpenBackupWIzard] = useState<boolean>(false)
     
    //  useEffect(() => {
    //      getEnabledAuthenticators().then((response)=> {
    //          console.log("getting here", response)
    //         const authenticators = response
            
    //         let authenticatorList;
    //         if (authenticators !== undefined) {
    //             authenticatorList = authenticators.split(",");
    //         } else {
    //             authenticatorList = []
    //         }
    //         if (authenticatorList.includes("Backup OTP Authenticator")) {
    //             setIsBackupCodeDisabled(false);
    //             // setShowBackupWIzard(true)
    //         }
    //      })
    //  })

     useEffect(() => {
         
        // Remove backup otp authenticator from authenticator list.
        getEnabledAuthenticators().then((response) => {
            console.log("getting authenticators", response)
            const authenticators = response
            
            let authenticatorList;
            if (authenticators !== undefined) {
                authenticatorList = authenticators.split(",");
            } else {
                authenticatorList = []
            }
            
            if (authenticatorList.length <= 1 && authenticatorList.includes("Backup OTP Authenticator")) {
                // authenticatorList.remove("TOTP Authenticator")
                authenticatorList.splice(authenticatorList.indexOf("Backup OTP Authenticator"), 1)
                const newEnabledAuthenticators = authenticatorList.join(",");
                console.log("is backup deletd", newEnabledAuthenticators)
                updateEnabledAuthenticators(newEnabledAuthenticators).then((response)=> {
                    console.log("updated successfully authenticatores all", response)
                    
                }).catch((error)=> {
                    console.log("failed update authenticators", error)
                });
            } else if (authenticatorList.length > 1) {
                setIsBackupCodeDisabled(false);
            }
            
        }).catch((errorMessage) => {
            console.log("my error", errorMessage)
        })
   
     }, [isBackupCodeDisabled])


     const backupWizard = (): JSX.Element => {
        
        return (<RenderBackupCodeWizard 
            onAlertFired={onAlertFired} 
            isForced={true} isInit={true} 
            openWizard={openBackupWizard} 
            onOpenWizardToggle={ (isOpen : boolean) => {setOpenBackupWIzard(isOpen) }} 
            onShowBackupCodeWizardToggle={ (show : boolean) => {setShowBackupWIzard(show) }}
            showBackupWizard={showBackupWizard}
            />)
    }

     return (
         <>
         
         <SettingsSection
             data-testid={ `${testId}-settings-section` }
             description={ t("myAccount:sections.mfa.description") }
             header={ t("myAccount:sections.mfa.heading") }
            
             onPrimaryActionClick={ !isBackupCodeDisabled ? () => {setShowBackupWIzard(true); setOpenBackupWIzard(true);} : null}
             primaryAction={ !isBackupCodeDisabled ? "Backup Codes" : "" }
         >
             {backupWizard()}
             <List
                 divided={ true }
                 verticalAlign="middle"
                 className="main-content-inner"
                 data-testid={ `${testId}-list` }
             >
                 { !isReadOnlyUser
                     && hasRequiredScopes(featureConfig?.security, featureConfig?.security?.scopes?.read, allowedScopes)
                     && isFeatureEnabled(
                         featureConfig?.security,
                         AppConstants.FEATURE_DICTIONARY.get("SECURITY_MFA_SMS")
                     ) ? (
                         <List.Item className="inner-list-item">
                             <SMSOTPAuthenticator
                                 featureConfig={ featureConfig }
                                 onAlertFired={ onAlertFired }
                             />
                         </List.Item>
                     ) : null }
 
                 { hasRequiredScopes(featureConfig?.security, featureConfig?.security?.scopes?.read, allowedScopes) &&
                     isFeatureEnabled(
                         featureConfig?.security,
                         AppConstants.FEATURE_DICTIONARY.get("SECURITY_MFA_FIDO")
                     ) ? (
                         <List.Item className="inner-list-item">
                             <FIDOAuthenticator onAlertFired={ onAlertFired } />
                         </List.Item>
                     ) : null }
 
                 { hasRequiredScopes(featureConfig?.security, featureConfig?.security?.scopes?.read, allowedScopes) &&
                     isFeatureEnabled(
                         featureConfig?.security,
                         AppConstants.FEATURE_DICTIONARY.get("SECURITY_MFA_TOTP")
                     ) ? (
                         <List.Item className="inner-list-item">
                             <TOTPAuthenticator 
                               onAlertFired={ onAlertFired }
                               onBackupCodeAvailabilityToggle={ (isEnabled: boolean) => (setIsBackupCodeDisabled(!isEnabled)) }
                               isBackupCodeForced={isBackupCodeForced}
                               isSuperTenantLogin={ AppConstants.getTenant() === AppConstants.getSuperTenant() }
                               
                            />
                         </List.Item>
                     ) : null }
                
                 {/* { AppConstants.getTenant() === AppConstants.getSuperTenant() && hasRequiredScopes(featureConfig?.security, featureConfig?.security?.scopes?.read, allowedScopes) &&
                     isFeatureEnabled(
                         featureConfig?.security,
                         AppConstants.FEATURE_DICTIONARY.get("SECURITY_MFA_BACKUP_CODE")
                     ) ? (
                         <List.Item className="inner-list-item">
                             <BackupCodeAuthenticator 
                                onAlertFired={ onAlertFired } 
                                isBackupCodeForced={ isBackupCodeForced } 
                                backupCodeDisabled={ isBackupCodeDisabled } 
                                onBackupCodeAvailabilityToggle={ (isDisabled: boolean) => (setIsBackupCodeDisabled(isDisabled)) }
                               
                            />
                         </List.Item>
                     ) : null } */}
             </List>
         </SettingsSection>
         </>
     );
 };

 
 
 /**
  * Default properties of {@link MultiFactorAuthentication}
  * See type definitions in {@link MfaProps}
  */
 MultiFactorAuthentication.defaultProps = {
     "data-testid": "multi-factor-authentication"
 };
