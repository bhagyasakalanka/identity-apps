import { TestableComponentInterface } from "@wso2is/core/models";
import { Heading, CopyInputField, EmptyPlaceholder } from "@wso2is/react-components";

 import React, { PropsWithChildren, useEffect, useState } from "react";
 import { Trans, useTranslation } from "react-i18next";
 import { useSelector, useDispatch } from "react-redux";
import {getEmptyPlaceholderIllustrations} from "../../../configs/ui"
 import {
     Button,
     Grid,
     Icon,
     IconGroup,
     List,
     Message,
     Popup,
     Segment,
     Header,
     Modal,
     GridColumn,
     Form,
     GridRow
     
 } from "semantic-ui-react";
 import {
     isMFAAuthenticatorEnabled,
     refreshBackupCode,
     getBackupCodes,
     getEnabledAuthenticators,
     updateEnabledAuthenticators
 } from "../../../api";
 import {
    AlertInterface,
    AlertLevels,
    AuthStateInterface,
} from "../../../models";
import { AppState } from "../../../store";

 /**
  * Property types for the backup code component.
  * Also see {@link BackupCodeAuthenticator.defaultProps}
  */
  interface BackupCodePropss extends TestableComponentInterface {
    onAlertFired: (alert: AlertInterface) => void;
    isForced: boolean;
    openWizard: boolean;
    isInit: boolean;
    onOpenWizardToggle(isOpen : boolean);
    showBackupWizard
    onShowBackupCodeWizardToggle(show : boolean)
    
}

export const RenderBackupCodeWizard : React.FunctionComponent<BackupCodePropss> = (
    props: PropsWithChildren<BackupCodePropss>
): React.ReactElement => {

    const { onAlertFired, isForced,openWizard, isInit, onOpenWizardToggle,  showBackupWizard, onShowBackupCodeWizardToggle, ["data-testid"]: testId } = props;
    const [backupCodes, setBackupCodes] = useState<Array<string>>();
    const [ListedbackupCodes, setListedBackupCodes] = useState<Array<Array<string>>>();
     const { t } = useTranslation();
     const dispatch = useDispatch();
     const translateKey = "myAccount:components.mfa.backupCode.";
    //  const [openWizard, setOpenWizard] = useState(false);
     console.log("is this running man3")
     const profileDetails: AuthStateInterface = useSelector(
        (state: AppState) => state.authenticationInformation
    );
    console.log("display is called")
    // console.log("this guy is running")
    // useEffect(() => {
    //     isMFAAuthenticatorEnabled("isBackupCodeEnabled").then((response) => {
    //         console.log("is enabled:", response);
    //         setIsbackupCodeConfigured(response);
    //     });
        
    // }, [isbackupCodeConfigured]);

    const updateListedBackupCodes = (backupCodeSet) => {

        const gridArr = []
        console.log("backupCodes in the update flow", backupCodeSet)
        if (backupCodeSet && backupCodeSet.length > 0) {
            
            let arr = []
            for (let index = 0; index < backupCodeSet.length; index++) {
                arr.push(backupCodeSet[index])
                if ((index + 1)%4 === 0){
                    gridArr.push(arr)
                    arr = []
                }
            }
            if (arr.length > 0) {
                gridArr.push(arr)
            }
        }
        setListedBackupCodes(gridArr);
    }

    useEffect(()=> {
        if (openWizard === true) {
            getBackupCodes().then((response) => {
                
                let backupCodes = response.data;
                console.log("am i getting called", backupCodes)
                if (isInit && (backupCodes === undefined || backupCodes.length === 0) ) {
                    refreshBackupCode().then((response) => {
                        backupCodes = response.data.backupCodes
                        setBackupCodes(backupCodes)
                        updateListedBackupCodes(backupCodes)
                        console.log("backup code refreshed", updateListedBackupCodes)
                    }).catch((error) => {
                        console.log("error refresh", error)
                    })
                } else {
                    console.log("calling this guy")
                    setBackupCodes(backupCodes)
                    updateListedBackupCodes(backupCodes)
                }
            }).catch((error)=> {
                console.log("error here", error)
            });
        }
    }, [openWizard])

    /**
      * Makes an API call to get the backup codes for the user
      */
     /**
      * Generates button text based on the input step
      * @param stepToDisplay The step number
      */
    const stepButtonText = (stepToDisplay: number): string => {
        switch (stepToDisplay) {
            case 0:
                return t("common:verify");
            case 1:
                return t("common:done");
            case 2:
                return t("common:continue"); 
        }
    };
    
    /**
     * Refreshes backup codes
     */
    const refreshBackCodes = () => {
        refreshBackupCode()
            .then((response) => {
                const backupCodes = response.data.backupCodes;
                setBackupCodes(backupCodes);
                updateListedBackupCodes(backupCodes)
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
    };
    
     const downloadBackupCodes = () => {
        if (backupCodes) {
            let backupCodeString = "";
            for (let i = 0; i < backupCodes.length; i += 2) {
                if (backupCodes[i + 1] !== undefined) {
                    backupCodeString +=
                        [i + 1] +
                        ". " +
                        backupCodes[i] +
                        "\t " +
                        [i + 2] +
                        ". " +
                        backupCodes[i + 1] +
                        "\n";
                } else {
                    backupCodeString += [i + 1] + ". " + backupCodes[i] + "\n";
                }
            }
    
            const blob = new Blob(
                [
                    t(translateKey + "download.heading") + "\n",
                    t(translateKey + "download.subHeading") + "\n\n",
                    backupCodeString + "\n",
                    "(" + profileDetails.username + ")\n\n",
                    "*" + t(translateKey + "download.info1") + "\n",
                    "*" + t(translateKey + "download.info2") + new Date(),
                ],
    
                { type: "application/json" }
            );
    
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.style.display = "none";
            a.href = url;
            a.download = "backup_codes.txt";
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
    
            // Sets a success notification.
            onAlertFired({
                description: t(
                    "myAccount:components.profileExport.notifications.downloadProfileInfo.success.description"
                ),
                level: AlertLevels.SUCCESS,
                message: t(
                    "myAccount:components.profileExport.notifications.downloadProfileInfo.success.message"
                ),
            });
        } else {
            onAlertFired({
                description: t(
                    "myAccount:components.profileExport.notifications.downloadProfileInfo." +
                        "genericError.description"
                ),
                level: AlertLevels.ERROR,
                message: t(
                    "myAccount:components.profileExport.notifications.downloadProfileInfo.genericError.message"
                ),
            });
        }
    };

        return (
            <Modal
                
                data-testid={`${testId}-modal`}
                dimmer="blurring"
                size="small"
                open={openWizard}
                onClose={() => {
                    onOpenWizardToggle(false);
                    onShowBackupCodeWizardToggle(false)
                }}
                className="wizard"
            >
                
                <Modal.Header className="wizard-header bold">
                    {/* {t(translateKey + "modals.heading")} */}
                    {"Backup Codes"}
                    <Heading as="h6">
                        {"One time passcodes that you can use to sign in"}
                    </Heading>
                </Modal.Header>
                
                <Modal.Content 
                    data-testid={`${testId}-modal-content`}
                    scrolling

                >
                <Heading size={"tiny"}  >
                {"Use the backup codes to sign in when you are away from your phone. You can genarate more when they are all used"}
                </Heading>
                
                {backupCodes && backupCodes.length > 0 ? (
                <Modal.Actions
                    data-testid={`${testId}-modal-actions`}
                    className="actions"
                    
                    
                >
                        <Message className="display-flex" size="small" info>
                            <Icon name="info" color="teal" corner />
                            <Message.Content className="tiny">{"Each code can only be used once"}</Message.Content>
                        </Message>
                    
                </Modal.Actions>
                ): null }
                <Segment attached={"top"} piled>
                {backupCodes && backupCodes.length > 0 ? (
                        <div>
                            <Button attached="left" floated="right" className="ui basic primary left floated button link-button" onClick={downloadBackupCodes}>
                                Download Codes
                            </Button>
                            <Button attached="right" floated="right" className="ui basic primary right floated button link-button" onClick={refreshBackCodes}>Refresh</Button>
                            
                        </div>
                        ) : null
                    }
                    {ListedbackupCodes && ListedbackupCodes.length > 0 ? (
                
                <Grid  container>
                    
                      {
                          ListedbackupCodes?.map((rowCodes, index)=> {
                              return (
                                  <GridRow stretched key={index}>
                                    {
                                        rowCodes?.map((code, index2)=> {
                                            return (
                                                <GridColumn  width={4} key={index2}>
                                                    <CopyInputField value={code}/>
                                                </GridColumn>
                                            )
                                        })
                                    }
                                  </GridRow>
                              )
                          })
                      } 
                </Grid>
                
                       
                ) : (
                    <Grid centered>
                            <EmptyPlaceholder
                                data-testid={ `${ testId }-empty-placeholder` }
                                image={ getEmptyPlaceholderIllustrations().newList }
                                subtitle={ [ "All of your backup codes are used. Lets generate a new set of backup codes" ] }
                                action={<Button  className="ui basic primary floated button link-button" onClick={refreshBackCodes}>Generate Codes</Button>}
                                
                            />    
                            </Grid>
                        )
                    }   
               
            </Segment>
                </Modal.Content>
                <Modal.Actions
                    
                >
                    <Button
                        
                        attached="top"
                        floated="left"
                        className="ui basic primary left floated button link-button"
                        onClick= { () => {
                            onOpenWizardToggle(false);
                            onShowBackupCodeWizardToggle(false);
                            // setIsbackupCodeConfigured(true);
                        } }
                    >
                        { "Cancel" }
                    </Button>
                   <Button
                        compact
                        floated="right"
                        primary
                        onClick= { () => {
                            onOpenWizardToggle(false);
                            onShowBackupCodeWizardToggle(false);
                            // setIsbackupCodeConfigured(true);
                        } }
                        >
                        { "Done" }
                    </Button>
                    
                </Modal.Actions>
            </Modal>
        );  
    
}


