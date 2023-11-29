import React, {useState, useCallback} from 'react';
import {noop} from 'lodash';
import {useIntl} from 'react-intl';
import {useLocation, useHistory} from 'react-router';
import type {ComponentType} from 'react';

import {useToast, useCustomerHiddenAttributes} from '@luft/common';
import {useViewerQuery} from '@luft/user';
import {useUpdateViewerMutation} from '@luft/account/src/hooks';
import messages from '@luft/account/src/components/AccountInfo.container/resources/messages';

import {useUpdateAndVerifyViewerMutation} from 'bat-core/account';
import {useExtractDobFromNationalIdLazyQuery} from 'bat-core/restrict-access';
import {useStoreConfigQuery} from 'bat-core/common';
import {isPhoneConfirmError} from 'bat-core/user';

import {AccountInfoComponent} from '../AccountInfo.component/AccountInfo.component';

type Props = {
    as?: ComponentType<{}>,
    onSaveInfoUpdates?: Function,
    onErrorSaveInfoUpdates?: Function
};

export function AccountInfoContainer(props: Props) {
    const {
        as: Component = AccountInfoComponent,
        onSaveInfoUpdates = noop,
        onErrorSaveInfoUpdates = noop,
        ...other
    } = props;

    const q = useViewerQuery();
    const viewerMutation = useUpdateViewerMutation();
    const updateAndVerifyViewerMutation = useUpdateAndVerifyViewerMutation();
    const extractDobQuery = useExtractDobFromNationalIdLazyQuery();
    const storeConfigQuery = useStoreConfigQuery();
    const hiddenFields = useCustomerHiddenAttributes();
    const {state} = useLocation();
    const {formatMessage} = useIntl();
    const addToast = useToast();
    const history = useHistory();

    const {isVerificationLocked, verificationError, isKtpIdRequiredError} = state || {};
    const [shownConfirmPhone, setShownConfirmPhone] = useState(false);
    const [delayedInfoChangeInput, setDelayedInfoChangeInput] = useState();
    const [viewerInfoMutation, {loading: viewerLoading, error: viewerError }] = viewerMutation;
    const [
        verifyViewerInfo,
        {loading: updateAndVerifyLoading, error: updateAndVerifyError}
    ] = updateAndVerifyViewerMutation;
    const [
        extractDobFromNationalId,
        {data: extractDobData, loading: extractDobLoading, error: extractDobError}
    ] = extractDobQuery;
    const account = q.data?.viewer?.user;
    const isEnabledDobAutocomplete = storeConfigQuery.data?.storeConfig?.is_enabled_dob_autocomplete;
    const isEnabledLoginWithMobile = storeConfigQuery.data?.storeConfig?.login_by_phone_enabled;
    const isEnabledSmsConfirmation = storeConfigQuery.data?.storeConfig?.sms_confirmation_enabled;
    const isEnabledPhoneConfirmation = isEnabledLoginWithMobile && isEnabledSmsConfirmation;
    const dob = extractDobData?.extractDobFromNationalId?.dob;
    const loading = viewerLoading || updateAndVerifyLoading || extractDobLoading;
    const error = viewerError || updateAndVerifyError || extractDobError || verificationError;

    const handleInfoChange = useCallback(async ({password, new_password, ...others}) => {
        try {
            setDelayedInfoChangeInput({password, new_password, ...others});
            if (isVerificationLocked || isKtpIdRequiredError) {
                try {
                    const resp = await verifyViewerInfo({viewer_info: others});
                    addToast(formatMessage(messages.save_success), 'success');
                    onSaveInfoUpdates(others);
                    history.push('/checkout');

                    return resp;
                } catch (e) {
                    onErrorSaveInfoUpdates(e);
                }
            } else {
                const resp = await viewerInfoMutation({viewer_info: others, password, new_password});
                addToast(formatMessage(messages.save_success), 'success');
                onSaveInfoUpdates({password, new_password, ...others});

                return resp;
            }
        } catch (e) {
            if (isPhoneConfirmError(e)) {
                setShownConfirmPhone(true);
            }
        }
    }, [
        isVerificationLocked,
        isKtpIdRequiredError,
        verifyViewerInfo,
        onSaveInfoUpdates,
        onErrorSaveInfoUpdates,
        viewerInfoMutation,
        addToast,
        formatMessage,
        history
    ]);

    const handleExtractDobFromNationalId = (ktpId) => {
        extractDobFromNationalId({variables: {national_id: ktpId}});
    };

    const handleCloseConfirmPhone = useCallback(() => {
        setShownConfirmPhone(false);
    }, []);

    // Trigger update info flow after phone confirmation
    const handleDelayedInfoChange = useCallback(() => {
        if (!delayedInfoChangeInput) return;

        handleCloseConfirmPhone();
        handleInfoChange(delayedInfoChangeInput);
    }, [delayedInfoChangeInput, handleInfoChange, handleCloseConfirmPhone]);

    return (
        <Component {...other}
                   q={q}
                   viewerMutation={viewerMutation}
                   account={{...account, ...(dob && {dob})}}
                   isVerificationLocked={isVerificationLocked}
                   isKtpIdRequiredError={isKtpIdRequiredError}
                   isEnabledDobAutocomplete={isEnabledDobAutocomplete}
                   isEnabledPhoneConfirmation={isEnabledPhoneConfirmation}
                   shownConfirmPhone={shownConfirmPhone}
                   phoneNumber={delayedInfoChangeInput?.phone_number}
                   loading={loading}
                   error={error}
                   hiddenFields={hiddenFields}
                   onExtractDobFromNationalId={handleExtractDobFromNationalId}
                   onSaveInfoUpdates={handleInfoChange}
                   onDelayedInfoChange={handleDelayedInfoChange}
                   onCloseConfirmPhone={handleCloseConfirmPhone}/>
    );
}
