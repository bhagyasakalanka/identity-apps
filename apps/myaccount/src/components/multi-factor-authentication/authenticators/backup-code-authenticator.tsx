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

 import { TestableComponentInterface } from "@wso2is/core/models";
 import { GenericIcon, CopyInputField } from "@wso2is/react-components";
 import React, { PropsWithChildren, useEffect, useRef, useState } from "react";
 import { Trans, useTranslation } from "react-i18next";
 import { useSelector, useDispatch } from "react-redux";
 import { Switch } from "react-router-dom";
 import { getProfileInformation, setActiveForm } from "../../../store/actions";
 import {
     Button,
     Checkbox,
     Container,
     Divider,
     Form,
     Grid,
     GridRow,
     Icon,
     IconGroup,
     List,
     Message,
     Modal,
     Popup,
     Segment,
     Header,
 } from "semantic-ui-react";
 import {
     isMFAAuthenticatorEnabled,
     deleteBackupCode,
     initBackupCode,
     getEnabledAuthenticators,
     updateEnabledAuthenticators
 } from "../../../api";
 import { getMFAIcons } from "../../../configs";
 import { SCIMConfigs } from "../../../extensions/configs/scim";
 import {
     AlertInterface,
     AlertLevels,
     AuthStateInterface,
 } from "../../../models";
 import { AppState } from "../../../store";
 import { appendFile } from "fs";

import {RenderBackupCodeWizard} from "./backup-code-display"
 /**
  * Property types for the backup code component.
  * Also see {@link BackupCodeAuthenticator.defaultProps}
  */
 interface BackupCodeProps extends TestableComponentInterface {
     onAlertFired: (alert: AlertInterface) => void;
     isBackupCodeForced: boolean;
     backupCodeDisabled: boolean;
     onBackupCodeAvailabilityToggle(isDisabled : boolean);
 }
 
 /**
  * Backup Code Authenticator.
  *
  * @param {React.PropsWithChildren<BackupCodeProps>} props - Props injected to the component.
  * @return {React.ReactElement}
  */
 export const BackupCodeAuthenticator: React.FunctionComponent<BackupCodeProps> = (
     props: PropsWithChildren<BackupCodeProps>
 ): React.ReactElement => {
     const { onAlertFired, 
        isBackupCodeForced, 
        backupCodeDisabled, 
        onBackupCodeAvailabilityToggle,
        
         ["data-testid"]: testId } = props;
 
     const [openWizard, setOpenWizard] = useState(false);
     const [step, setStep] = useState(0);
     const [error, setError] = useState(false);
     const [isBackupCodeConfigured, setIsBackupCodeConfigured ] = useState<boolean>(false);
     const enableMFAUserWise: boolean = useSelector((state: AppState) => state?.config?.ui?.features["security"].enableMFAUserWise);
     const [backupCodeToggle, setBackupCodeToggle] = useState<boolean>(false);
     const [showBackupCodeWizard, setShowBackupCodeWizard] = useState<boolean>(false);
     const [revokeBackupCodeAuthnModalVisibility,setRevokeBackupCodeAuthnModalVisibility] = useState(false);
     
    //  const [isDisabled, setDisabled] = useState<boolean>(true);
     const { t } = useTranslation();
     const dispatch = useDispatch();
     const profileDetails: AuthStateInterface = useSelector(
         (state: AppState) => state.authenticationInformation
     );
 

     const backupCodeConfig = useSelector(
         (state: AppState) => state?.config?.ui?.authenticatorApp
     );
 
     const translateKey = "myAccount:components.mfa.backupCode.";
 
     useEffect(() => {
        isMFAAuthenticatorEnabled("isBackupCodeEnabled").then((response) => {
            setIsBackupCodeConfigured(response);
        });
    }, []);

     /**
      * Reset error and step when the modal is closed
      */
     useEffect(() => {
         if (!openWizard) {
             setError(false);
             setStep(0);
         }
         setUpBackupCodeState();
     }, [openWizard]);
 
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
                    onBackupCodeAvailabilityToggle(false);
                } 
                
            }).catch((errorMessage) => {
                console.log("my error", errorMessage)
            })
       
     }, [backupCodeDisabled])

    
    //  useEffect(() => {
    //      isMFAAuthenticatorEnabled("isBackupCodeEnabled").then((response) => {
    //          console.log("is enabled:", response);
    //          setIsbackupCodeConfigured(response);
    //      });
    //  }, [isbackupCodeConfigured]);
 
     const setUpBackupCodeState = (): void => {
         dispatch(getProfileInformation(true));
         getEnabledAuthenticators()
             .then((response) => {
                 const authenticators = response;
                 let authenticatorList;
                 if (authenticators !== undefined) {
                     authenticatorList = authenticators.split(",");
                 } else {
                     authenticatorList = []
                 }
                 if (authenticatorList.length >= 1)
                 if (authenticatorList.includes("Backup OTP Authenticator")) {
                     setBackupCodeToggle(true)
                     onBackupCodeAvailabilityToggle(false)
                 } else {
                     onBackupCodeAvailabilityToggle(true)
                     setBackupCodeToggle(false)
                 }
             })
             .catch((errorMessage) => {
                 console.log("my error", errorMessage);
             });
     };
 
     const toggleBackupCode = (): void => {
         dispatch(getProfileInformation(true));
         if (backupCodeToggle === true) {
             disableBackupCodeAuthentication()
         } else {
             enableBackupCodeAuthenticator()
         }
     };
 
    //  const disableBackup = () => {
    //      console.log("revokeBackupCodeAuthnModalVisibility", revokeBackupCodeAuthnModalVisibility, isbackupCodeConfigured)
    //      if (revokeBackupCodeAuthnModalVisibility === false) {
    //         console.log("desabiling revokeBackupCodeAuthnModalVisibility", revokeBackupCodeAuthnModalVisibility)
         
    //         disableBackupAuthenticator().then((response) => {
    //             if (response.data === true) {
    //                 setIsbackupCodeConfigured(false)
    //             } else {
    //                 //TODO error
    //             }

    //         }).catch((error)=>{
    //             console.log("error", error)
    //         })
    //     }
    // }
     const disableBackupCodeAuthentication = () => {
 
         getEnabledAuthenticators()
                 .then((response) => {
                     console.log("my response", response);
                     const authenticators = response;
                     console.log("my authenticators", authenticators);
                     let authenticatorList;
                     if (authenticators !== undefined) {
                         authenticatorList = authenticators.split(",");
                     } else {
                         authenticatorList = [];
                     }
                     console.log("my list", authenticatorList);
                     if (
                         authenticatorList.includes("Backup OTP Authenticator")
                     ) {
                         authenticatorList.splice(
                             authenticatorList.indexOf(
                                 "Backup OTP Authenticator"
                             ),
                             1
                         );
                         console.log("list after sliced:", authenticatorList);
                     }
                     const newEnabledAuthenticators = authenticatorList.join(
                         ","
                     );
                     updateEnabledAuthenticators(newEnabledAuthenticators)
                         .then((response) => {
                             console.log(
                                 "updated successfully authenticatores",
                                 response
                             );
                             setBackupCodeToggle(false);
                            //  setIsBackupCodeDisabled(true)
                         })
                         .catch((error) => {
                             console.log("failed update authenticators", error);
                         });
                 })
                 .catch((errorMessage) => {
                     console.log("my error", errorMessage);
                 });
     }

     const openBackupFlow = () => {
        setOpenWizard(true);
        enableBackupCodeAuthenticator()
     }
 
    const initBackupFlow = () => {   
        initBackupCode()
                .then((response) => {
                    setOpenWizard(true);
                    enableBackupCodeAuthenticator()
                })
                .catch((errorMessage) => {
                    onAlertFired({
                        description: t(
                            translateKey +
                                "notifications.initError.error.description",
                            {
                                error: errorMessage,
                            }
                        ),
                        level: AlertLevels.ERROR,
                        message: t(
                            translateKey + "notifications.initError.error.message"
                        ),
                    });
                });
    }
     const enableBackupCodeAuthenticator = () => {
 
         getEnabledAuthenticators()
                 .then((response) => {
                     console.log("my response2", response);
                     const authenticators = response;
                     console.log("my authenticators2", authenticators);
                     let authenticatorList;
                     if (authenticators !== undefined) {
                         authenticatorList = authenticators.split(",");
                     } else {
                         authenticatorList = [];
                     }
                     console.log("my list2", authenticatorList);
                     if (
                         !authenticatorList.includes("Backup OTP Authenticator")
                     ) {
                         authenticatorList.push("Backup OTP Authenticator");
                     }
                     const newEnabledAuthenticators = authenticatorList.join(
                         ","
                     );
                     updateEnabledAuthenticators(newEnabledAuthenticators)
                         .then((response) => {
                             console.log(
                                 "updated successfully authenticatores2",
                                 response
                             );
                             setBackupCodeToggle(true);
                         })
                         .catch((error) => {
                             console.log("failed update authenticators2", error);
                         });
                 })
                 .catch((errorMessage) => {
                     console.log("my error", errorMessage);
                 });
     }
 
 
     /**
      *  Initiate deletion of BackupCode configuration.
      */
     const initDeleteBackupCode = (): void => {
         deleteBackupCode()
             .then((response) => {
                 setIsBackupCodeConfigured(false);
                 disableBackupCodeAuthentication();
                 onBackupCodeAvailabilityToggle(true)
                 return;
             })
             .catch((errorMessage) => {
                 onAlertFired({
                     description: t(
                         translateKey +
                             "notifications.deleteError.error.description",
                         {
                             error: errorMessage,
                         }
                     ),
                     level: AlertLevels.ERROR,
                     message: t(
                         translateKey + "notifications.deleteError.error.message"
                     ),
                 });
             })
             .finally(() => {
                 setRevokeBackupCodeAuthnModalVisibility(false);
             });
     };

     /**
      * This renders the success message at the end of the backup code flow
      */
     const renderSuccess = (): JSX.Element => {
         return (
             <Segment className="backup-code">
                 <div className="svg-box">
                     <svg className="circular positive-stroke">
                         <circle
                             className="path"
                             cx="75"
                             cy="75"
                             r="50"
                             fill="none"
                             strokeWidth="5"
                             strokeMiterlimit="10"
                         />
                     </svg>
                     <svg className="positive-icon positive-stroke">
                         <g transform="matrix(0.79961,8.65821e-32,8.39584e-32,0.79961,-489.57,-205.679)">
                             <path
                                 className="positive-icon__check"
                                 fill="none"
                                 d="M616.306,283.025L634.087,300.805L673.361,261.53"
                             />
                         </g>
                     </svg>
                 </div>
                 <p className="success-content">
                     {t(translateKey + "modals.done")}
                 </p>
             </Segment>
         );
     };
 
     /**
      * Handle the revoke Backup Code Configuration modal close event.
      */
     const handleRevokeBackupCodeAuthnClick = (): void => {
         setRevokeBackupCodeAuthnModalVisibility(true);
     };
 
     /**
      * Handle the revoke Backup Code Configuration modal close event.
      */
     const handleRevokeBackupCodeAuthnModalClose = (): void => {
         setRevokeBackupCodeAuthnModalVisibility(false);
     };
 
     /**
      * This renders the Backup Code Authenticator delete Modal
      */
     const revokeBackupCodeAuthnModal = (
         <Modal
             data-testid={`${testId}-termination-modal`}
             size="mini"
             open={revokeBackupCodeAuthnModalVisibility}
             onClose={handleRevokeBackupCodeAuthnModalClose}
             dimmer="blurring"
         >
             <Modal.Content data-testid={`${testId}-termination-modal-content`}>
                 <Container>
                     <h3>{t(translateKey + "modals.delete.heading")}</h3>
                 </Container>
                 <br />
                 <p>{t(translateKey + "modals.delete.message")}</p>
             </Modal.Content>
             <Modal.Actions data-testid={`${testId}-termination-modal-actions`}>
                 <Button
                     className="link-button"
                     onClick={handleRevokeBackupCodeAuthnModalClose}
                     data-testid={`${testId}-termination-modal-actions-cancel-button`}
                 >
                     {t("common:cancel")}
                 </Button>
                 <Button
                     primary={true}
                     onClick={initDeleteBackupCode}
                     data-testid={`${testId}-termination-modal-actions-terminate-button`}
                 >
                     {t("common:remove")}
                 </Button>
             </Modal.Actions>
         </Modal>
     );
 
     /**
      * This renders the backup code wizard
      */
     const backupCodeWizard = (): JSX.Element => {
        return (<RenderBackupCodeWizard 
            onAlertFired={onAlertFired} 
            isForced={true} isInit={false} 
            openWizard={openWizard} 
            onOpenWizardToggle={ (isOpen : boolean) => {setOpenWizard(isOpen)} }
            showBackupWizard={showBackupCodeWizard}
            onShowBackupCodeWizardToggle={ (show : boolean) => {setShowBackupCodeWizard(show)}} />)
     }
 
     return backupCodeDisabled && isBackupCodeForced ? (
        null
     ) : backupCodeDisabled && !isBackupCodeForced && !isBackupCodeConfigured ?(
        <>
        {backupCodeWizard()}
        <Grid padded={true} data-testid={testId}>
            <Grid.Row columns={2}>
                <Grid.Column width={1} className="first-column">
                    <List.Content floated="left">
                        <GenericIcon
                            icon={getMFAIcons().backupCode}
                            size="mini"
                            twoTone={true}
                            transparent={true}
                            square={true}
                            rounded={true}
                            relaxed={true}
                        />
                    </List.Content>
                </Grid.Column>
                <Grid.Column width={enableMFAUserWise ? 11 : 12} className="first-column">
                    <List.Content>
                        <List.Header>
                            {t(translateKey + "heading") + " test"}
                        </List.Header>
                        <List.Description>
                            {t(translateKey + "description")}
                        </List.Description>
                    </List.Content>
                </Grid.Column>
                
                <Grid.Column width={enableMFAUserWise ? 4 : 3} className="last-column">
                    <List.Content floated="right">
                        <Popup
                            trigger={
                                <Icon
                                    link={true}
                                    onClick={initBackupFlow}
                                    className="list-icon padded-icon"
                                    size="small"
                                    color="grey"
                                    name="plus"
                                    data-testid={`${testId}-view-button`}
                                />
                            }
                            content={t(translateKey + "addHint")}
                            inverted
                        />
                    </List.Content>
                </Grid.Column>
            </Grid.Row>
        </Grid>
    </>
     ):(
         <>
            {revokeBackupCodeAuthnModal}
             {backupCodeWizard()}
             <Grid padded={true} data-testid={testId}>
                 
                 <Grid.Row columns={2}>
                     <Grid.Column width={1} className="first-column">
                         <List.Content floated="left">
                             <GenericIcon
                                 icon={getMFAIcons().backupCode}
                                 size="mini"
                                 twoTone={true}
                                 transparent={true}
                                 square={true}
                                 rounded={true}
                                 relaxed={true}
                             />
                         </List.Content>
                     </Grid.Column>
                     <Grid.Column
                         width={ 12 }
                         className="first-column"
                     >
                         <List.Content>
                             <List.Header>
                                 {t(translateKey + "heading")}
                             </List.Header>
                             <List.Description>
                                 {t(translateKey + "configuredDescription")}
                             </List.Description>
                         </List.Content>
                     </Grid.Column>
                     { enableMFAUserWise && !isBackupCodeForced ?  (
                                <Grid.Column width={ 1 }>
                                    <List.Content >
                                        <Popup 
                                            trigger={
                                                (
                                                    <Checkbox
                                                        toggle
                                                        data-tourid="conditional-auth"
                                                        onChange={ toggleBackupCode }
                                                        checked={ backupCodeToggle }
                                                        className="conditional-auth-accordion-toggle"
                                                    />
                                                )
                                            }
                                            inverted
                                            content={ t(translateKey + "enableHint")}
                                        />
                                    </List.Content>
                                </Grid.Column>
                            ): null} 
                     <Grid.Column
                         width={ enableMFAUserWise ? 2 : 3 }
                         className="last-column"
                         floated="right"
                     >
                         <List.Content floated="right">
                        { !isBackupCodeForced ? (
                         <Popup
                                 trigger={
                                     <Icon
                                         link={true}
                                         onClick={() => {
                                             handleRevokeBackupCodeAuthnClick();
                                         }}
                                         className="list-icon padded-icon"
                                         size="small"
                                         color="grey"
                                         name="trash alternate"
                                     />
                                 }
                                 inverted
                                 content={t(translateKey + "deleteHint")}
                             />
                        ) : null}
                             <Popup
                                 trigger={
                                     <Icon
                                         link={true}
                                         onClick={openBackupFlow}
                                         className="list-icon padded-icon"
                                         size="small"
                                         color="grey"
                                         name="eye"
                                         data-testid={`${testId}-view-button`}
                                     />
                                 }
                                 content={t(translateKey + "hint")}
                                 inverted
                             />
                         </List.Content>
                     </Grid.Column>
                 </Grid.Row>
             </Grid>
         </>
     );
 };
 
 /**
  * Default properties for {@link BackupCodeAuthenticator}
  * See type definitions in {@link BackupCodeProps}
  */
 BackupCodeAuthenticator.defaultProps = {
     "data-testid": "backup-otp-authenticator",
 };
