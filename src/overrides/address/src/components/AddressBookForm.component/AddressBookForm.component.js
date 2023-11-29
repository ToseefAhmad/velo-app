import React, {useCallback, useState} from 'react';
import {useIntl} from 'react-intl';
import {useForm} from 'react-hook-form';

import {
    ButtonComponent,
    FormGroupComponent,
    CountryContainer
} from '@luft/common';
import type {User} from '@luft/types';

import messages from '@luft/address/src/components/AddressBookForm.component/resources/messages';

import {
    RegionControlComponent,
    CityControlComponent,
    CustomCityControlComponent,
    DistrictControlComponent,
    CityDistributorsContainer,
    getStoreCodeByPathname,
    useFormInputRules
} from 'bat-core/common';

import custom_messages from '../../../../../address/components/AddressBookForm.component/resources/messages';

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
     * Address
     */
    address?: Object,
    /**
     * Address settings
     */
    addressSettings?: AddressSettings,
    /**
     * User information
     */
    account?: User,
    /**
     * Callback on submitting the form
     */
    onSubmitAddress?: (input: Object) => void
};

const DEFAULT_STREET_MAX_LINES = 1;
const DEFAULT_SHOW_COMPANY = 'optional';

export function AddressBookFormComponent(props: Props) {
    const {
        onSubmitAddress,
        address,
        addressSettings = {},
        account
    } = props;

    const {
        address_id,
        city: initialCity,
        district,
        company,
        country,
        firstname,
        lastname,
        postcode,
        region,
        street,
        telephone,
        default_shipping,
        default_billing
    } = address || {};

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
    const {formatMessage} = useIntl();

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

    const handleOnSaveAddress = useCallback(async data => {
        if (!onSubmitAddress) return;

        const {city, other_city, ...addressToSave} = data;

        return await onSubmitAddress({
            address_id,
            address: {
                ...addressToSave,
                city: other_city || city
            },
            default_shipping,
            default_billing
        });
    }, [address_id, default_shipping, default_billing, onSubmitAddress]);

    return (
        <form noValidate
              className="address-book-form-component"
              onSubmit={handleSubmit(handleOnSaveAddress)}>
            <fieldset>
                <legend>
                    {formatMessage(messages.contact_details)}
                </legend>
                <div className="address-book-form-component-personal-fields-holder">
                    <FormGroupComponent controlId="addressBookFirstName"
                                        name="firstname"
                                        label={formatMessage(messages.first_name)}
                                        defaultValue={firstname}
                                        readOnly={!!firstname}
                                        errors={errors}
                                        ref={register({
                                            required: true,
                                            validate: getTrimRule
                                        })}/>
                    <FormGroupComponent controlId="addressBookLastName"
                                        name="lastname"
                                        label={formatMessage(messages.last_name)}
                                        defaultValue={lastname}
                                        readOnly={!!lastname}
                                        errors={errors}
                                        ref={register({
                                            required: true,
                                            validate: getTrimRule
                                        })}/>
                    <FormGroupComponent controlId="addressBookPhoneNumber"
                                        name="telephone"
                                        label={formatMessage(messages.phone_number)}
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
                    {formatMessage(messages.address_text)}
                </legend>
                <div className="address-book-form-component-address-fields-holder">
                    {isShownCompany && (
                        <FormGroupComponent controlId="addressBookCompany"
                                            name="company"
                                            label={
                                                show_company === 'required'
                                                    ? formatMessage(custom_messages.company)
                                                    : formatMessage(custom_messages.company_optional)
                                            }
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
                                                controlId={`addressBookAddress${i + 1}`}
                                                name={`street[${i}]`}
                                                label={label}
                                                defaultValue={street?.[i]}
                                                errors={errors}
                                                ref={register(rules)}/>
                        );
                    })}
                    <CountryContainer selectedCountryCode={selectedCountryCode}
                                      controlId="addressBookCountry"
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
                                              controlId="addressBookState"
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
                                              controlId="addressBookCity"
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
                                              controlId="addressBookDistrict"
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
                                              controlId="addressBookState"
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
                                                           controlId="addressBookCity"
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
                                                  controlId="addressBookCity"
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
                    <FormGroupComponent controlId="addressBookPostcode"
                                        name="postcode"
                                        label={formatMessage(messages.postcode)}
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
            <div className="address-book-form-component-submit-wrapper">
                <ButtonComponent className="address-book-form-component-submit"
                                 variant="secondary"
                                 type="submit"
                                 title={formatMessage(messages.save_address)}>
                    {formatMessage(messages.save_address)}
                </ButtonComponent>
            </div>
        </form>
    );
}
