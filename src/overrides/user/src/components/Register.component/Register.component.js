import React, {useEffect} from 'react';
import {useIntl} from 'react-intl';

import {
    BackComponent,
    ErrorComponent,
    useResolutions
} from '@luft/common';
import {
    RegisterFormComponent,
    LoginNavControlComponent,
    SocialProvidersContainer
} from '@luft/user';
import type {RegisterInput} from '@luft/types';
import messages from '@luft/user/src/components/Register.component/resources/messages';

import {PhoneNumberConfirmationContainer, isPhoneConfirmError} from 'bat-core/user';

type Props = {
    error?: Error,
    loading?: boolean,
    registerInput?: RegisterInput,
    isEmailPredefined?: boolean,
    isSocialRegister?: boolean,
    referralCode?: string,
    shownConfirmPhone?: boolean,
    phoneNumber?: string,
    onRegister?: Function,
    onDelayedRegister?: Function,
    onNavigateLogin?: Function,
    onCloseConfirmPhone?: Function
};

export function RegisterComponent(props: Props) {
    const {formatMessage} = useIntl();

    const {
        error,
        loading,
        registerInput = {},
        isEmailPredefined = false,
        isSocialRegister = false,
        referralCode = '',
        shownConfirmPhone,
        phoneNumber,
        onRegister,
        onDelayedRegister,
        onNavigateLogin,
        onCloseConfirmPhone,
        ...other
    } = props;
    const {order_ids} = registerInput;
    const {isSMdown} = useResolutions();

    useEffect(() => {
        if (!error || typeof window === 'undefined') return;

        window.scrollTo({top: 0});
    }, [error]);

    const errorMessage = isPhoneConfirmError(error) ? null : error;

    return (
        <div className="register-component">
            {isSMdown ? (
                <BackComponent title={formatMessage(messages.register)}
                               onBack={onNavigateLogin}
                               variant="header"/>
            ) : (
                <h3 className="register-component-title">
                    {formatMessage(messages.register)}
                </h3>
            )}
            {errorMessage && <ErrorComponent error={errorMessage}/>}
            <RegisterFormComponent onRegister={onRegister}
                                   loading={loading}
                                   registerInput={registerInput}
                                   isEmailPredefined={isEmailPredefined}
                                   isSocialRegister={isSocialRegister}
                                   referralCode={referralCode}
                                   {...other}/>
            <LoginNavControlComponent onNavigate={onNavigateLogin}/>
            {!isSocialRegister && <SocialProvidersContainer orderIds={order_ids}
                                                            referralCode={referralCode}/>}
            <PhoneNumberConfirmationContainer showModal={shownConfirmPhone}
                                              phoneNumber={phoneNumber}
                                              onProcessRequest={onDelayedRegister}
                                              onClose={onCloseConfirmPhone}/>
        </div>
    );
}
