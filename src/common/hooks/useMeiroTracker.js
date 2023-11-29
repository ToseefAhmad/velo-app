import {useIntl} from 'react-intl';

import {useIsAuthorized} from '@luft/user';

// CUSTOM FIELDS:
// field00: KTP,
// field01: DOB,
// field02: Referal Code,
// field03: Promo Code,
// field04: Qty,
// field05: Address 1,
// field06: Address 2 (optional),
// field07: Country code,
// field08: City,
// field09: District,
// field10: Postcode,
// field11: Shipping Method,
// field12: Payment Method,
// field13: Gender,
// field14: Region

export const useMeiroTracker = () => {
    const {locale} = useIntl();
    const isLoggedIn = useIsAuthorized();

    const tracker = {
        onVisitPage: (userId) => {
            if (!window?.MeiroEvents || locale !== 'id-ID') return;

            const user_id = isLoggedIn ? userId : window.MeiroEvents.getUserId();

            window.MeiroEvents.track('pageView', {
                custom_payload: {
                    user_id
                }
            });
        },
        onSubmitLogInForm: (data) => {
            if (!window?.MeiroEvents || locale !== 'id-ID') return;

            const payload = {
                form_id: 'log_in',
                email: data?.login
            };

            window.MeiroEvents.track('contactFormSubmit', payload);
        },
        onSubmitRegistrationForm: (data) => {
            if (!window?.MeiroEvents || locale !== 'id-ID') return;

            const payload = {
                form_id: 'registration_form',
                email: data?.email,
                first_name: data?.first_name,
                last_name: data?.last_name,
                gender: data?.gender,
                phone_number: data?.phone_number,
                field00: data?.ktp_id,
                field01: data?.dob,
                field02: data?.referral
            };

            window.MeiroEvents.track('contactFormSubmit', payload);
        },
        onSubmitEmailContactInfoForm: (data) => {
            if (!window?.MeiroEvents || locale !== 'id-ID') return;

            const payload = {
                email: data,
                form_id: 'email_contact_info'
            };

            window.MeiroEvents.track('contactFormSubmit', payload);
        },
        onSubmitMainPageCheckoutForm: (data, customerKtpId) => {
            if (!window?.MeiroEvents || locale !== 'id-ID') return;

            const payload = {
                form_id: 'main_checkout_info',
                field00: customerKtpId,
                field02: data?.actionField?.referral_code,
                field03: data?.actionField?.coupon,
                field04: data?.products?.[0]?.quantity
            };

            window.MeiroEvents.track('contactFormSubmit', payload);
        },
        onSubmitPasswordRecoveryForm: () => {
            if (!window?.MeiroEvents || locale !== 'id-ID') return;

            const payload = {
                form_id: 'password_recovery'
            };

            window.MeiroEvents.track('contactFormSubmit', payload);
        },
        onSubmitEmailConfirmation: (data) => {
            if (!window?.MeiroEvents || locale !== 'id-ID') return;
            if (data instanceof Error) return;

            const payload = {
                form_id: 'email_confirmation'
            };

            window.MeiroEvents.track('contactFormSubmit', payload);
        },
        onSubmitShippingAddress: (data) => {
            if (!window?.MeiroEvents || locale !== 'id-ID') return;

            const payload = {
                form_id: 'shipping_adress',
                first_name: data?.firstname,
                last_name: data?.lastname,
                phone_number: data?.telephone,
                field05: data?.street?.[0],
                field06: data?.street?.[1],
                field07: data?.country_code,
                field08: data?.city,
                field09: data?.district,
                field10: data?.postcode
            };

            window.MeiroEvents.track('contactFormSubmit', payload);
        },
        onSubmitShippingMethod: (data) => {
            if (!window?.MeiroEvents || locale !== 'id-ID') return;

            const payload = {
                form_id: 'shipping_method',
                field11: data?.method_code
            };

            window.MeiroEvents.track('contactFormSubmit', payload);
        },
        onSubmitPaymentMethod: (data) => {
            if (!window?.MeiroEvents || locale !== 'id-ID') return;

            const payload = {
                form_id: 'payment_method',
                field12: data?.code
            };

            window.MeiroEvents.track('contactFormSubmit', payload);
        },
        onSubmitBillingAddress: (data) => {
            if (!window?.MeiroEvents || locale !== 'id-ID') return;

            const payload = {
                form_id: 'billing_address',
                first_name: data?.first_name,
                last_name: data?.last_name,
                phone_number: data?.phone_number
            };

            window.MeiroEvents.track('contactFormSubmit', payload);
        },
        onSubmitProfileInfo: (data) => {
            if (!window?.MeiroEvents || locale !== 'id-ID') return;

            const payload = {
                form_id: 'profile_info',
                first_name: data?.input?.first_name,
                last_name: data?.input?.last_name,
                phone_number: data?.phone,
                email: data?.email,
                field00: data?.input?.ktp_id,
                field01: data?.input?.dob,
                field13: data?.input?.gender,
                field02: data?.input?.referral
            };

            window.MeiroEvents.track('contactFormSubmit', payload);
        },
        onSubmitAddressInfo: (data) => {
            if (!window?.MeiroEvents || locale !== 'id-ID') return;

            const payload = {
                form_id: 'address_info',
                first_name: data?.firstname,
                last_name: data?.lastname,
                phone_number: data?.telephone,
                field05: data?.street?.[0],
                field06: data?.street?.[1],
                field07: data?.country_code,
                field09: data?.district,
                field08: data?.city,
                field10: data?.postcode,
                field14: data?.region
            };

            window.MeiroEvents.track('contactFormSubmit', payload);
        }
    };

    return tracker;
};
