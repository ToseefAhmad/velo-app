import React, {useEffect, useState} from 'react';
import {
    Route,
    Switch,
    useHistory
} from 'react-router';

import {useResolutions} from '@luft/common';
import {
    ShippingMethodContainer,
    ShippingAddressAddComponent
} from '@luft/shipping';
import {CheckoutContactInfoContainer} from '@luft/checkout';
import {PaymentMethodListContainer} from '@luft/payment';
import {BillingAddressContainer, BillingAddressAddComponent} from '@luft/billing';
import {useIsEmailRegisteredQuery} from '@luft/user';

import {CheckoutSuccessContainer, CheckoutInfoContainer} from 'bat-core/checkout';
import {getStoreCodeByPathname} from 'bat-core/common';
import {ShippingAddressContainer} from 'bat-core/shipping';

import {useMeiroTracker} from '../../common';

export function CheckoutSwitch() {
    const history = useHistory();
    const {isSMdown} = useResolutions();
    const [emailToSave, setEmailToSave] = useState();
    const {
        onSubmitBillingAddress,
        onSubmitMainPageCheckoutForm,
        onSubmitShippingAddress,
        onSubmitShippingMethod,
        onSubmitPaymentMethod,
        onSubmitEmailContactInfoForm
    } = useMeiroTracker();
    const {data: isEmailRegisteredData, loading: isEmailRegisteredLoading} = useIsEmailRegisteredQuery(emailToSave);
    const storeCode = getStoreCodeByPathname();
    const isIDLocale = storeCode === 'id';
    const isAELocale = storeCode === 'uae';

    const onCreateOrder = (data, checkoutFormData) => {
        const {purchase, customerKtpId} = checkoutFormData;
        onSubmitMainPageCheckoutForm(purchase, customerKtpId);
        history.replace('/checkout/success', data);
    };

    const onBack = () => history.replace('/checkout');
    const onSelectPaymentMethod = (res) => {
        const selectedPaymentMethod = res?.data?.setPaymentMethodOnCart?.selected_payment_method?.payment_method;
        onSubmitPaymentMethod(selectedPaymentMethod);
        history.replace('/checkout');
    };
    const onNavigateLogin = () => history.push('/account/login', {from: '/checkout'});
    const onNavigateAskGuestLogin = () => history.push('/account/login', {from: '/checkout'});
    const onNavigateCart = () => history.replace('/cart');
    const onNavigateContactInfo = () => history.replace('/checkout/contact-info');
    const onNavigateShippingAddress = () => history.replace('/checkout/shipping-address');
    const onNavigateShippingMethod = () => history.replace('/checkout/shipping-method');
    const onNavigatePaymentMethod = () => history.replace('/checkout/payment-method');
    const onNavigateBillingAddress = () => history.replace('/checkout/billing-address');
    const onNavigateAddNewShippingAddress = () => history.replace('/checkout/shipping-address-add');
    const onNavigateAddNewBillingAddress = () => history.replace('/checkout/billing-address-add');
    const onSaveShippingAddress = () => history.replace('/checkout');
    const onSaveShippingMethod = (res) => {
        const shippingMethod = res?.data?.setShippingMethodsOnCart?.shipping_addresses?.[0]?.shipping_methods?.[0];
        onSubmitShippingMethod(shippingMethod);
        history.replace('/checkout');
    };
    const onSaveBillingAddress = () => history.replace('/checkout');
    const onAddShippingAddress = (res, input) => {
        onSubmitShippingAddress(input);
        history.replace('/checkout/shipping-address');
    };
    const onChangeShippingAddress = () => history.replace('/checkout');
    const onAddBillingAddress = (res) => {
        const billingAddressData = res?.data?.addAddress?.user;
        onSubmitBillingAddress(billingAddressData);
        history.replace('/checkout/billing-address');
    };
    const onChangeBillingAddress = () => history.replace('/checkout');
    const onBillingAsShipping = () => history.replace('/checkout');

    useEffect(() => {
        if (!isEmailRegisteredData || isEmailRegisteredLoading) return;

        onSubmitEmailContactInfoForm(emailToSave);
        const isEmailRegistered = isEmailRegisteredData?.isUserEmailAvailable?.registered;

        if (isEmailRegistered) {
            history.push('/account/login', {from: '/checkout', email: emailToSave});
        } else {
            history.replace('/checkout');
        }
    }, [isEmailRegisteredData]);

    return (
        <Switch>
            <Route exact
                   path="/checkout"
                   render={() => (
                       <CheckoutInfoContainer onCreateOrder={onCreateOrder}
                                              onNavigateLogin={onNavigateLogin}
                                              onNavigateAskGuestLogin={onNavigateAskGuestLogin}
                                              onNavigateCart={onNavigateCart}
                                              onNavigateContactInfo={onNavigateContactInfo}
                                              onNavigateShippingAddress={onNavigateShippingAddress}
                                              onNavigateShippingMethod={onNavigateShippingMethod}
                                              onNavigatePaymentMethod={onNavigatePaymentMethod}
                                              onNavigateBillingAddress={onNavigateBillingAddress}
                                              onNavigateAddNewShippingAddress={onNavigateAddNewShippingAddress}
                                              onNavigateAddNewBillingAddress={onNavigateAddNewBillingAddress}
                                              onSaveShippingAddress={onSaveShippingAddress}
                                              onSaveShippingMethod={onSaveShippingMethod}
                                              onSaveBillingAddress={onSaveBillingAddress}
                                              onAddShippingAddress={onAddShippingAddress}
                                              onChangeShippingAddress={onChangeShippingAddress}
                                              onAddBillingAddress={onAddBillingAddress}
                                              onChangeBillingAddress={onChangeBillingAddress}
                                              onBillingAsShipping={onBillingAsShipping}
                                              redirectToEdit={isIDLocale}
                                              validateKtpIdBeforeCreateOrder={!isAELocale}
                                              hideCheckoutKtpId={isAELocale}/>
                   )}/>
            <Route exact
                   path="/checkout/success"
                   render={() => (
                       <CheckoutSuccessContainer onRedirect={onNavigateCart}
                                                 onContinueShopping={() => history.push('/')}
                                                 onRegister={() => history.push('/')}/>
                   )}/>
            {isSMdown ? (
                <>
                    <Route path="/checkout/contact-info"
                           render={() => (
                               <CheckoutContactInfoContainer onSaveEmail={setEmailToSave}
                                                             onBack={onBack}
                                                             onNavigateLogin={onNavigateLogin}/>
                           )}/>
                    <Route exact
                           path="/checkout/shipping-address"
                           render={() => (
                               <ShippingAddressContainer onSaveAddress={() => history.replace('/checkout')}
                                                         onChangeAddress={() => history.replace('/checkout')}
                                                         onNavigateAdd={() => history.replace('/checkout/shipping-address-add')}
                                                         onBack={onBack}/>
                           )}/>
                    <Route path="/checkout/shipping-address-add"
                           render={() => (
                               <ShippingAddressAddComponent onSaveAddress={() => history.replace('/checkout/shipping-address')}
                                                            onBack={() => history.replace('/checkout/shipping-address')}/>
                           )}/>
                    <Route path="/checkout/shipping-method"
                           render={() => (
                               <ShippingMethodContainer onSaveShippingMethod={() => history.replace('/checkout')}
                                                        onBack={onBack}/>
                           )} />
                    <Route exact
                           path="/checkout/payment-method"
                           render={() => (
                               <PaymentMethodListContainer onSelectPaymentMethod={onSelectPaymentMethod}
                                                           onBack={onBack}/>
                           )}/>
                    <Route exact
                           path="/checkout/billing-address"
                           render={() => (
                               <BillingAddressContainer onSaveAddress={() => history.replace('/checkout')}
                                                        onChangeAddress={() => history.replace('/checkout')}
                                                        onNavigateAdd={() => history.replace('/checkout/billing-address-add')}
                                                        onBack={onBack}/>
                           )}/>
                    <Route exact
                           path="/checkout/billing-address-add"
                           render={() => (
                               <BillingAddressAddComponent onSaveAddress={() => history.replace('/checkout')}
                                                           onBack={() => history.replace('/checkout/billing-address')}/>
                           )}/>
                </>
            ) : (
                <Route path="/checkout/:step"
                       render={({match: {params: {step}}}) => (
                           <CheckoutInfoContainer step={step}
                                                  onSaveContactInfo={setEmailToSave}
                                                  onSelectPaymentMethod={onSelectPaymentMethod}
                                                  onCreateOrder={onCreateOrder}
                                                  onNavigateLogin={onNavigateLogin}
                                                  onNavigateAskGuestLogin={onNavigateAskGuestLogin}
                                                  onNavigateCart={onNavigateCart}
                                                  onNavigateContactInfo={onNavigateContactInfo}
                                                  onNavigateShippingAddress={onNavigateShippingAddress}
                                                  onNavigateShippingMethod={onNavigateShippingMethod}
                                                  onNavigatePaymentMethod={onNavigatePaymentMethod}
                                                  onNavigateBillingAddress={onNavigateBillingAddress}
                                                  onNavigateAddNewShippingAddress={onNavigateAddNewShippingAddress}
                                                  onNavigateAddNewBillingAddress={onNavigateAddNewBillingAddress}
                                                  onSaveShippingAddress={onSaveShippingAddress}
                                                  onSaveShippingMethod={onSaveShippingMethod}
                                                  onSaveBillingAddress={onSaveBillingAddress}
                                                  onAddShippingAddress={onAddShippingAddress}
                                                  onChangeShippingAddress={onChangeShippingAddress}
                                                  onAddBillingAddress={onAddBillingAddress}
                                                  onChangeBillingAddress={onChangeBillingAddress}
                                                  onBillingAsShipping={onBillingAsShipping}
                                                  redirectToEdit={isIDLocale}
                                                  validateKtpIdBeforeCreateOrder={!isAELocale}
                                                  hideCheckoutKtpId={isAELocale}/>
                       )}/>
            )}
        </Switch>
    );
}
