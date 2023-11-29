import React, {useCallback, useState} from 'react';
import type {ComponentType} from 'react';
import {useIntl} from 'react-intl';
import {useLocation, useHistory} from 'react-router-dom';
import {parse} from 'query-string';

import {useToast, useStoreConfigQuery} from '@luft/common';
import {RegisterComponent, useRegisterMutation} from '@luft/user';
import type {RegisterInput} from '@luft/types';
import messages from '@luft/user/src/components/Register.container/resources/messages';

import {useExtractDobFromNationalIdLazyQuery} from 'bat-core/restrict-access';
import {useStorage} from 'bat-core/common';
import {trackRegistration, trackNewsletter} from 'bat-core/data-layer';
import {getReferralManager, isPhoneConfirmError} from 'bat-core/user';
import custom_messages from 'bat-core/user/src/components/Register.container/resources/messages';

import {useMeiroTracker} from '../../../../../common';

type Props = {
    as?: ComponentType<{}>,
    registerInput?: RegisterInput,
    referralCode?: string,
    isEmailPredefined?: boolean,
    onRegister: Function
};

const DEFAULT_BACK_URL = '/account';

export function RegisterContainer(props: Props) {
    const {pathname, search, state = {}} = useLocation();
    const {getCode, clearCode} = getReferralManager();

    const {
        as: Component = RegisterComponent,
        registerInput = {},
        referralCode = getCode(pathname),
        isEmailPredefined = false,
        onRegister,
        ...other
    } = props;

    const registerMutation = useRegisterMutation();
    const {formatMessage} = useIntl();
    const addToast = useToast();
    const history = useHistory();
    const storeConfigQuery = useStoreConfigQuery();
    const extractDobQuery = useExtractDobFromNationalIdLazyQuery();
    const {onSubmitRegistrationForm} = useMeiroTracker();
    const {getValue: getDobValue} = useStorage({key: 'dob'});

    const [isReferralFieldReadOnly, setIsReferralFieldReadOnly] = useState(!!referralCode);
    const [shownConfirmPhone, setShownConfirmPhone] = useState(false);
    const [delayedRegisterInput, setDelayedRegisterInput] = useState();

    const [
        register,
        {data: registerData, loading: registerLoading, error: registerError}
    ] = registerMutation;
    const [
        extractDobFromNationalId,
        {data: extractDobData, loading: extractDobLoading, error: extractDobError}
    ] = extractDobQuery;

    const {socialName, socialRegisterInput, from} = state;
    const {social_register} = parse(search);
    const account = registerData?.register?.user;
    const dob = extractDobData?.extractDobFromNationalId?.dob || getDobValue();
    const isSocialRegister = social_register === 'true' && !!socialRegisterInput;
    const storeConfig = storeConfigQuery.data?.storeConfig;
    const {
        is_referral_program_enabled: isReferralProgramEnabled,
        enable_subscription: isEnabledSubscription,
        is_enabled_dob_autocomplete: isEnabledDobAutocomplete,
        customer_minimum_password_length: minimumPasswordLength,
        password_required_character_classes_number: passwordRequiredClassesCount,
        login_by_phone_enabled: isEnabledLoginWithMobile,
        sms_confirmation_enabled: isEnabledSmsConfirmation
    } = storeConfig || {};
    const isEnabledPhoneConfirmation = isEnabledLoginWithMobile && isEnabledSmsConfirmation;

    const handleRegister = useCallback(async (input) => {
        try {
            const backUrl = from || DEFAULT_BACK_URL;
            setDelayedRegisterInput(input);

            const resp = await register({...input, back_url: backUrl});
            onSubmitRegistrationForm(input);

            const isConfirmedAccount = resp?.data?.register?.confirmed !== false;

            if (!isConfirmedAccount) {
                history.push('/account/login', {showAccountConfirmNotification: true, backUrl});
                return resp;
            }

            if (isSocialRegister) {
                const message = formatMessage(custom_messages.social_register_in_success, {social_name: socialName});

                addToast(message, 'success');
            } else {
                addToast(formatMessage(messages.registration_success), 'success');
            }

            if (onRegister) onRegister({...resp, isSocialRegister});
            trackRegistration('success');
            clearCode();

            const hasConsent = resp?.data?.register?.user?.consent;

            if (hasConsent) {
                trackNewsletter();
            }

            return resp;
        } catch (err) {
            if (input.referral) {
                setIsReferralFieldReadOnly(false);
            }

            if (isPhoneConfirmError(err)) {
                setShownConfirmPhone(true);
            }
        }
    }, [
        from,
        isSocialRegister,
        socialName,
        addToast,
        formatMessage,
        history,
        register,
        onRegister
    ]);

    const handleExtractDobFromNationalId = (ktpId) => {
        extractDobFromNationalId({variables: {national_id: ktpId}});
    };

    const handleCloseConfirmPhone = useCallback(() => {
        setShownConfirmPhone(false);
    }, []);

    // Trigger registration flow after phone confirmation
    const handleDelayedRegister = useCallback(() => {
        if (!delayedRegisterInput) return;

        handleCloseConfirmPhone();
        handleRegister(delayedRegisterInput);
    }, [delayedRegisterInput, handleRegister, handleCloseConfirmPhone]);

    return (
        <Component {...other}
                   m={registerMutation}
                   account={account}
                   isEnabledSubscription={isEnabledSubscription}
                   loading={registerLoading}
                   extractDobLoading={extractDobLoading}
                   error={registerError || extractDobError}
                   registerInput={{...registerInput, ...socialRegisterInput, ...(dob && {dob})}}
                   isEmailPredefined={isEmailPredefined}
                   isSocialRegister={isSocialRegister}
                   referralCode={isReferralProgramEnabled ? referralCode : ''}
                   isReferralFieldReadOnly={isReferralProgramEnabled && isReferralFieldReadOnly}
                   isEnabledDobAutocomplete={isEnabledDobAutocomplete}
                   minimumPasswordLength={minimumPasswordLength}
                   passwordRequiredClassesCount={passwordRequiredClassesCount}
                   isEnabledPhoneConfirmation={isEnabledPhoneConfirmation}
                   shownConfirmPhone={shownConfirmPhone}
                   phoneNumber={delayedRegisterInput?.phone_number}
                   onRegister={handleRegister}
                   onDelayedRegister={handleDelayedRegister}
                   onExtractDobFromNationalId={handleExtractDobFromNationalId}
                   onCloseConfirmPhone={handleCloseConfirmPhone}/>
    );
}
