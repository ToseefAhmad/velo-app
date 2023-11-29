import React, {
    useContext,
    useState,
    useEffect,
    useCallback
} from 'react';
import {isEmpty} from 'lodash';
import {useIntl} from 'react-intl';
import {useForm} from 'react-hook-form';

import {
    ButtonComponent,
    FormGroupComponent,
    CountryContainer,
    LoaderComponent,
    ErrorComponent
} from '@luft/common';
import type {BillingCartAddress, User} from '@luft/types';

import messages from '@luft/billing/src/components/BillingAddressForm.component/resources/messages';

import {
    RegionControlComponent,
    CityControlComponent,
    CustomCityControlComponent,
    DistrictControlComponent,
    CityDistributorsContainer,
    getStoreCodeByPathname,
    useFormInputRules
} from 'bat-core/common';
import {CheckoutContext} from 'bat-core/checkout';

import custom_messages from '../../../../../billing/components/BillingAddressForm.component/resources/messages';

type AddressSettings = {
    /**
     * Postcode maximum length, used for validation
     */
    postcode_max_length: number,
    /**
     * Postcode minimum length, used for validation
     */
    postcode_min_length: number,
    /**
     * Indicator, which is used for applying a particular settings to a 'company' field
     */
    show_company: 'required' | 'optional' | null,
    /**
     * Amount of 'street' fields
     */
    street_max_lines: number
};

type Props = {
    /**
     * Billing address settings
     */
    addressSettings?: AddressSettings,
    /**
     * Billing Address assigned to cart as selected
     */
    selectedAddress?: BillingCartAddress,
    /**
     * User information
     */
    account?: User,
    /**
     * Flag, that either Billing Address is loading or save of new Billing Address is
     */
    loading?: boolean,
    /**
     * Error, that should be displayed on top of component, usually identifies Billing Address save failure
     */
    error?: Error,
    /**
     * Callback used on when new/edited Billing Address should be saved
     */
    onSubmit?: (Object) => void,
    /**
     * Title of submit button
     */
    saveActionTitle?: string
};

const DEFAULT_STREET_MAX_LINES = 1;
const DEFAULT_SHOW_COMPANY = 'optional';

export function BillingAddressFormComponent(props: Props) {
    const {formatMessage} = useIntl();

    const {
        addressSettings = {},
        selectedAddress,
        account,
        loading,
        error,
        onSubmit,
        saveActionTitle = formatMessage(messages.use_this_address)
    } = props;

    const {
        city: initialCity,
        district,
        company,
        country,
        firstname,
        lastname,
        postcode,
        region,
        street,
        telephone
    } = selectedAddress || {};

    const {
        phone_number,
        phone_is_confirmed
    } = account || {};

    const {
        show_company = DEFAULT_SHOW_COMPANY,
        street_max_lines = DEFAULT_STREET_MAX_LINES
    } = addressSettings;

    const {register, handleSubmit, errors, setValue} = useForm();
    const {getMinLengthRule, getMaxLengthRule, getTrimRule, getPhoneRule} = useFormInputRules();
    const {onSetCheckoutErrors} = useContext(CheckoutContext);

    const [selectedCountryCode, setSelectedCountryCode] = useState(country?.code);
    const [selectedRegion, setSelectedRegion] = useState(region?.code);
    const [selectedCity, setSelectedCity] = useState(initialCity);
    const [selectedDistrict, setSelectedDistrict] = useState(district);

    const streetHouseNumberErrorMessage = formatMessage(custom_messages.error_house_number);
    const storeCode = getStoreCodeByPathname();
    const isIDLocale = storeCode === 'id';
    const isPkLocale = storeCode === 'pk';
    const isShownCompany = show_company !== null;
    const isRequiredPostcode = isIDLocale;
    const accountPhoneNumber = phone_is_confirmed ? phone_number : undefined;
    const phoneNumber = telephone || accountPhoneNumber;

    const clearDistrictData = useCallback(() => {
        setValue('district', '');
        setSelectedDistrict(null);
    }, [setValue]);

    const clearCityData = useCallback(() => {
        setValue('city', '');
        setSelectedCity(null);
        clearDistrictData();
    }, [setValue, clearDistrictData]);

    const clearRegionData = useCallback(() => {
        setValue('region', '');
        setSelectedRegion(null);
        clearCityData();
    }, [setValue, clearCityData]);

    const onCountryChange = useCallback(({target}, {setFirstValueAsDefault} = {}) => {
        setSelectedCountryCode(target.value);

        if (setFirstValueAsDefault) return;

        clearRegionData();
    }, [clearRegionData]);

    const onRegionChange = useCallback(({target}, {setFirstValueAsDefault} = {}) => {
        setSelectedRegion(target.value);

        if (setFirstValueAsDefault) return;

        clearCityData();
    }, [clearCityData]);

    const onCityChange = useCallback(({target}, {setFirstValueAsDefault} = {}) => {
        setSelectedCity(target.value);

        if (setFirstValueAsDefault) return;

        clearDistrictData();
    }, [clearDistrictData]);

    const onDistrictChange = useCallback(({target}) => {
        setSelectedDistrict(target.value);
    }, []);

    const handleOnSubmit = useCallback(data => {
        if (!onSubmit) return;

        const {city, other_city, ...address} = data;

        onSubmit({...address, city: other_city || city});
    }, [onSubmit]);

    useEffect(() => {
        if (!isEmpty(errors)) {
            onSetCheckoutErrors(errors, 'address empty', 3);
        }
    }, [errors, onSetCheckoutErrors]);

    return (
        <form noValidate
              className="billing-address-form-component"
              onSubmit={handleSubmit(handleOnSubmit)}>
            {loading && <LoaderComponent type="overlay"/>}
            {error && <ErrorComponent error={error}/>}
            <fieldset>
                <legend>
                    {formatMessage(messages.contact_details)}
                </legend>
                <div className="billing-address-form-component-personal-fields-holder">
                    <FormGroupComponent controlId="billingFirstName"
                                        label={formatMessage(messages.first_name)}
                                        name="firstname"
                                        defaultValue={firstname}
                                        errors={errors}
                                        ref={register({
                                            required: true,
                                            validate: getTrimRule
                                        })}/>
                    <FormGroupComponent controlId="billingLastName"
                                        label={formatMessage(messages.last_name)}
                                        name="lastname"
                                        defaultValue={lastname}
                                        errors={errors}
                                        ref={register({
                                            required: true,
                                            validate: getTrimRule
                                        })}/>
                    <FormGroupComponent controlId="billingPhoneNumber"
                                        label={formatMessage(messages.phone_number)}
                                        name="telephone"
                                        defaultValue={phoneNumber}
                                        errors={errors}
                                        ref={register({
                                            required: true,
                                            ...getPhoneRule()
                                        })}/>
                </div>
            </fieldset>
            <fieldset>
                <legend>
                    {formatMessage(messages.billing_address)}
                </legend>
                <div className="billing-address-form-component-address-fields-holder">
                    {isShownCompany && (
                        <FormGroupComponent controlId="billingCompany"
                                            label={
                                                show_company === 'required'
                                                    ? formatMessage(custom_messages.company)
                                                    : formatMessage(custom_messages.company_optional)
                                            }
                                            name="company"
                                            defaultValue={company}
                                            errors={errors}
                                            ref={register({
                                                required: show_company === 'required',
                                                validate: getTrimRule
                                            })}/>
                    )}
                    {Array(street_max_lines).fill().map((_, i) => {
                        const isFirstStreetLine = !i;
                        const label = isFirstStreetLine
                            ? formatMessage(messages.address)
                            : formatMessage(custom_messages.additional_address, {number: i + 1});
                        const rules = isFirstStreetLine && {
                            required: true,
                            pattern: {
                                value: /\d+/,
                                message: streetHouseNumberErrorMessage
                            },
                            ...getMinLengthRule('street')
                        };

                        return (
                            // eslint-disable-next-line react/no-array-index-key
                            <FormGroupComponent key={i}
                                                controlId={`billingAddress${i + 1}`}
                                                name={`street[${i}]`}
                                                label={label}
                                                defaultValue={street?.[i]}
                                                errors={errors}
                                                ref={register(rules)}/>
                        );
                    })}
                    <CountryContainer selectedCountryCode={selectedCountryCode}
                                      controlId="billingCountry"
                                      name="country_code"
                                      label={formatMessage(messages.country)}
                                      isLabelActive={true}
                                      errors={errors}
                                      ref={register({required: true})}
                                      onChange={onCountryChange}/>
                    {isIDLocale ? (
                        <>
                            <CountryContainer selectedCountryCode={selectedCountryCode}
                                              selectedRegion={selectedRegion}
                                              as={RegionControlComponent}
                                              controlId="billingState"
                                              label={formatMessage(messages.state)}
                                              errors={errors}
                                              ref={register({required: true})}
                                              onChange={onRegionChange}
                                              defaultOption={selectedCountryCode
                                                ? formatMessage(custom_messages.select_first,
                                                     {field: formatMessage(messages.country)})
                                                : formatMessage(custom_messages.select_option)}/>
                            <CountryContainer selectedCountryCode={selectedCountryCode}
                                              selectedRegion={selectedRegion}
                                              selectedCity={selectedCity}
                                              as={CityControlComponent}
                                              controlId="billingCity"
                                              label={formatMessage(messages.city)}
                                              errors={errors}
                                              ref={register({required: true})}
                                              onChange={onCityChange}
                                              defaultOption={formatMessage(custom_messages.select_first, {
                                                  field: formatMessage(messages.state)
                                              })}/>
                            <CountryContainer selectedCountryCode={selectedCountryCode}
                                              selectedRegion={selectedRegion}
                                              selectedCity={selectedCity}
                                              selectedDistrict={selectedDistrict}
                                              as={DistrictControlComponent}
                                              controlId="billingDistrict"
                                              label={formatMessage(custom_messages.district)}
                                              errors={errors}
                                              ref={register({required: true})}
                                              onChange={onDistrictChange}
                                              defaultOption={formatMessage(custom_messages.select_first, {
                                                  field: formatMessage(messages.city)
                                              })}/>
                        </>
                    ) : (
                        <>
                            <CountryContainer selectedCountryCode={selectedCountryCode}
                                              selectedRegion={selectedRegion}
                                              as={RegionControlComponent}
                                              controlId="billingState"
                                              label={formatMessage(messages.state)}
                                              errors={errors}
                                              ref={register({required: true})}
                                              onChange={onRegionChange}
                                              defaultOption={selectedCountryCode
                                                ? formatMessage(custom_messages.select_first,
                                                     {field: formatMessage(messages.country)})
                                                : formatMessage(custom_messages.select_option)}/>
                            {isPkLocale ? (
                                <CityDistributorsContainer selectedRegion={selectedRegion}
                                                           selectedCity={selectedCity}
                                                           as={CustomCityControlComponent}
                                                           controlId="billingCity"
                                                           label={formatMessage(messages.city)}
                                                           errors={errors}
                                                           register={register}
                                                           onChange={onCityChange}
                                                           defaultOption={formatMessage(custom_messages.select_first, {
                                                               field: formatMessage(messages.state)
                                                           })}/>
                            ) : (
                                <CountryContainer selectedCountryCode={selectedCountryCode}
                                                  selectedRegion={selectedRegion}
                                                  selectedCity={selectedCity}
                                                  as={CityControlComponent}
                                                  controlId="billingCity"
                                                  label={formatMessage(messages.city)}
                                                  errors={errors}
                                                  ref={register({required: true})}
                                                  onChange={onCityChange}
                                                  defaultOption={formatMessage(custom_messages.select_first, {
                                                      field: formatMessage(messages.state)
                                                  })}/>
                            )}
                        </>
                    )}
                    <FormGroupComponent controlId="billingPostcode"
                                        label={formatMessage(messages.postcode)}
                                        name="postcode"
                                        defaultValue={postcode}
                                        errors={errors}
                                        ref={register({
                                            required: isRequiredPostcode,
                                            pattern: {
                                                value: /^\d+$/,
                                                message: formatMessage(custom_messages.error_postcode_characters)
                                            },
                                            ...getMinLengthRule('postcode'),
                                            ...getMaxLengthRule('postcode')
                                        })}/>
                </div>
            </fieldset>
            <ButtonComponent className="billing-address-form-component-submit"
                             variant="secondary"
                             type="submit"
                             title={saveActionTitle}>
                {saveActionTitle}
            </ButtonComponent>
        </form>
    );
}
