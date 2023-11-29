import React, {useEffect} from 'react';
import {useIntl} from 'react-intl';
import {useForm} from 'react-hook-form';
import classnames from 'classnames';
import {parse as parseDate} from 'date-fns';

import {
    ButtonComponent,
    FormGroupComponent,
    LoaderComponent,
    GenderSelectComponent,
    CheckboxComponent,
    useValidationPatterns,
    useCustomerHiddenAttributes
} from '@luft/common';
import type {RegisterInput} from '@luft/types';
import messages from '@luft/user/src/components/RegisterForm.component/resources/messages';

import {
    getStoreCodeByPathname,
    getPhonePrefixByStoreCode,
    getDateFormatByStoreCode,
    getFormattedDate,
    useFormInputRules,
    useStorage,
    isValidDob
} from 'bat-core/common';
import {useKtpIdValidation, useLegalAge} from 'bat-core/restrict-access';
import {trackRegistration} from 'bat-core/data-layer';

import custom_messages from '../../../../../user/components/RegisterForm.component/resources/messages';

type Props = {
    loading?: boolean,
    registerInput?: RegisterInput,
    extractDobLoading?: boolean,
    isEmailPredefined?: boolean,
    isConfirmPassword?: boolean,
    isSocialRegister?: boolean,
    referralCode?: string,
    isReferralFieldReadOnly?: boolean,
    isEnabledDobAutocomplete?: boolean,
    minimumPasswordLength?: number,
    passwordRequiredClassesCount?: number,
    isEnabledPhoneConfirmation?: boolean,
    onRegister?: Function,
    onExtractDobFromNationalId?: Function
};

const HOUR = 60 * 60 * 1000;

export function RegisterFormComponent(props: Props) {
    const {formatMessage} = useIntl();
    const {register, errors, handleSubmit, setValue, trigger, watch, getValues} = useForm({mode: 'onBlur'});
    const {getMinLengthRule, getTrimRule, getPasswordRule} = useFormInputRules();
    const hiddenFields = useCustomerHiddenAttributes();
    const {email: emailPattern} = useValidationPatterns();
    const {validateKtpId} = useKtpIdValidation();
    const {legalAge, legalDate} = useLegalAge();
    const {getValue: getKtpIdValue} = useStorage({key: 'ktpID'});
    const storeCode = getStoreCodeByPathname();
    const phonePrefix = getPhonePrefixByStoreCode();
    const {dateFormat} = getDateFormatByStoreCode();

    const {
        loading,
        extractDobLoading,
        registerInput = {},
        isEmailPredefined = false,
        isConfirmPassword = true,
        isSocialRegister = false,
        referralCode = '',
        isReferralFieldReadOnly = false,
        minimumPasswordLength,
        passwordRequiredClassesCount,
        isEnabledDobAutocomplete = false,
        isEnabledPhoneConfirmation,
        onRegister,
        onExtractDobFromNationalId
    } = props;
    const {
        first_name,
        last_name,
        email,
        dob,
        gender,
        phone_number,
        order_ids
    } = registerInput;

    const passwordRules = getPasswordRule(minimumPasswordLength, passwordRequiredClassesCount);
    const emailClassNames = classnames('register-form-component-email', {
        'register-form-component-email-predefined': email && isEmailPredefined
    });
    const phoneClassNames = classnames('phone-component', `phone-component-${storeCode}`);
    const ktpId = getKtpIdValue();
    const isIndonesia = storeCode === 'id';

    // Prefill dob if ktpId already exists.
    // Adding `ktpId` to deps will cause an additional unnecessary request
    useEffect(() => {
        if (!isIndonesia || !ktpId || !isEnabledDobAutocomplete || !onExtractDobFromNationalId) return;

        onExtractDobFromNationalId(ktpId);
    }, [isIndonesia, isEnabledDobAutocomplete]);

    // Update actual form value after changing the ktpId
    useEffect(() => {
        if (!isIndonesia || !dob) return;

        setValue('dob', getFormattedDate(dob));
    }, [dob, isIndonesia, setValue]);

    const isRenderField = (name) => !hiddenFields.includes(name);

    const handleOnRegister = async ({phone_number: phone, confirmPassword, ...inputToSave}) => {
        // If dob field was disabled, it was not automatically added to submit input
        const formattedDob = getFormattedDate(getValues('dob'), true);

        onRegister({
            ...inputToSave,
            dob: formattedDob,
            is_social_register: isSocialRegister,
            order_ids: order_ids || [],
            phone_number: `${phonePrefix}${phone}`
        });
    };

    const handleOnError = (formErrors) => trackRegistration('fail', formErrors);
    const handleValidateConfirmPassword = (value) => value === watch('password') || formatMessage(messages.confirm_password_error);

    const handleValidateDateOfBirth = (value) => {
        const date = parseDate(value, dateFormat, new Date());

        if (!isValidDob(date)) {
            return formatMessage(custom_messages.incorrect_date_format);
        }

        return legalDate >= date || formatMessage(custom_messages.dob_error_message, {age: legalAge});
    };

    const handleChangeKtpId = ({target}) => {
        setValue('ktp_id', target.value.replace(/[^0-9]/g, ''));
    };

    const handleChangePhoneNumber = ({target}) => {
        setValue('phone_number', target.value.replace(/[^0-9]/g, ''));
    };

    const handleValidateKtpId = (value) => {
        const {isValid, reason} = validateKtpId(value);

        if (isValid) return true;

        switch (reason) {
            case 'invalid-format':
                return formatMessage(custom_messages.error_message_empty);

            case 'invalid-age':
            default:
                return formatMessage(custom_messages.ktp_error_message, {age: legalAge});
        }
    };

    const handleExtractDobFromNationalId = ({target}) => {
        if (!isIndonesia || !isEnabledDobAutocomplete) return;

        const enteredKtpId = target.value;
        const {isValid} = validateKtpId(enteredKtpId);

        if (!isValid || !onExtractDobFromNationalId) return;

        onExtractDobFromNationalId(enteredKtpId);
    };

    // Prevent attempt of changing the dob manually in case it was disabled
    const handleChangeDob = () => {
        if (!isIndonesia || !isEnabledDobAutocomplete) return;

        const today = getFormattedDate(new Date());

        setValue('dob', today);
    };

    return (
        <form noValidate
              className="register-form-component"
              onSubmit={handleSubmit(handleOnRegister, handleOnError)}>
            {extractDobLoading && <LoaderComponent type="overlay"
                                                   size="sm"/>}

            <fieldset>
                <div className="register-form-component-fields">
                    {(isRenderField('first_name') || isRenderField('firstname')) && (
                        <FormGroupComponent controlId="first_name"
                                            name="first_name"
                                            defaultValue={first_name}
                                            errors={errors}
                                            label={formatMessage(messages.first_name)}
                                            ref={register({
                                                required: true,
                                                validate: getTrimRule
                                            })}/>
                    )}
                    {(isRenderField('last_name') || isRenderField('lastname')) && (
                        <FormGroupComponent controlId="last_name"
                                            name="last_name"
                                            defaultValue={last_name}
                                            errors={errors}
                                            label={formatMessage(messages.last_name)}
                                            ref={register({
                                                required: true,
                                                validate: getTrimRule
                                            })}/>
                    )}
                    {isRenderField('email') && (
                        <FormGroupComponent controlId="email"
                                            name="email"
                                            type="email"
                                            defaultValue={email}
                                            errors={errors}
                                            readOnly={email && (isEmailPredefined || isSocialRegister)}
                                            label={formatMessage(messages.email)}
                                            className={emailClassNames}
                                            ref={register({
                                                required: true,
                                                pattern: emailPattern
                                            })}/>
                    )}
                    {isRenderField('ktp_id') && (
                        <FormGroupComponent controlId="ktp_id"
                                            name="ktp_id"
                                            type="text"
                                            defaultValue={ktpId}
                                            errors={errors}
                                            label={formatMessage(custom_messages.ktp_id)}
                                            onInput={handleChangeKtpId}
                                            onBlur={handleExtractDobFromNationalId}
                                            ref={register({
                                                validate: handleValidateKtpId
                                            })}/>
                    )}
                    {isRenderField('dob') && (
                        <FormGroupComponent controlId="dob"
                                            type="datepicker"
                                            name="dob"
                                            autoComplete="off"
                                            errors={errors}
                                            label={formatMessage(messages.dob)}
                                            isLabelActive={true}
                                            defaultValue={dob}
                                            ref={null}
                                            register={register({
                                                required: true,
                                                validate: handleValidateDateOfBirth
                                            })}
                                            disabled={isIndonesia && isEnabledDobAutocomplete}
                                            trigger={trigger}
                                            onChange={handleChangeDob}
                                            dateFormat={dateFormat}
                                            datePickerProps={{
                                                disabledDays: [{
                                                    after: new Date(Date.now() - 24 * HOUR)
                                                }]
                                            }}/>
                    )}
                    {isRenderField('gender') && (
                        <FormGroupComponent inputAs={GenderSelectComponent}
                                            controlId="gender"
                                            name="gender"
                                            errors={errors}
                                            label={formatMessage(messages.gender)}
                                            defaultValue={gender}
                                            isLabelActive={true}
                                            ref={register({required: true})}/>
                    )}
                    {isRenderField('phone_number') && (
                        <>
                            <FormGroupComponent controlId="phone_number"
                                                className={phoneClassNames}
                                                name="phone_number"
                                                defaultValue={phone_number}
                                                errors={errors}
                                                label={formatMessage(custom_messages.phone_number)}
                                                onInput={handleChangePhoneNumber}
                                                ref={register({
                                                    required: true,
                                                    ...getMinLengthRule('phone')
                                                })}/>
                            {isEnabledPhoneConfirmation && (
                                <div className="register-form-component-tooltip">
                                    {formatMessage(custom_messages.phone_tooltip)}
                                </div>
                            )}
                        </>
                    )}
                    <FormGroupComponent controlId="referral"
                                        name="referral"
                                        ref={register}
                                        defaultValue={referralCode}
                                        readOnly={isReferralFieldReadOnly}
                                        label={formatMessage(custom_messages.referral)}/>
                    {!isSocialRegister && (
                        <>
                            <FormGroupComponent controlId="password"
                                                name="password"
                                                type="password"
                                                errors={errors}
                                                label={formatMessage(messages.password)}
                                                ref={register({
                                                    required: true,
                                                    ...passwordRules
                                                })}/>
                            <div className="register-form-component-tooltip">
                                {formatMessage(custom_messages.tooltip_password, {
                                    minLength: minimumPasswordLength,
                                    minClasses: passwordRequiredClassesCount
                                })}
                            </div>
                            {isConfirmPassword && (
                                <FormGroupComponent controlId="confirmPassword"
                                                    name="confirmPassword"
                                                    type="password"
                                                    errors={errors}
                                                    label={formatMessage(messages.confirm_password)}
                                                    ref={register({
                                                        required: true,
                                                        validate: handleValidateConfirmPassword
                                                    })}/>
                            )}
                        </>
                    )}
                    <CheckboxComponent id="terms_conditions"
                                       label={formatMessage(custom_messages.terms_conditions)}
                                       name="terms_conditions"
                                       errors={errors}
                                       ref={register({required: true})}/>
                    <CheckboxComponent id="consent"
                                       label={formatMessage(custom_messages.consent)}
                                       name="consent"
                                       errors={errors}
                                       ref={register}/>
                </div>
            </fieldset>
            <ButtonComponent className="register-form-component-submit"
                             type="submit"
                             disabled={loading}
                             title={formatMessage(messages.register_submit)}>
                <span className="register-form-component-submit-title">
                    {formatMessage(messages.register_submit)}
                </span>
                {loading && (
                    <LoaderComponent size="sm"
                                     variant="light"
                                     type="attached"/>
                )}
            </ButtonComponent>
        </form>
    );
}
