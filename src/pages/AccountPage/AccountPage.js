import './AccountPage.scss';

import React from 'react';
import {
    useRouteMatch,
    useHistory,
    useLocation
} from 'react-router';

import {AccountMenuContainer} from '@luft/account';
import {useResolutions, useStoreConfigQuery} from '@luft/common';
import {useIsAuthorized} from '@luft/user';

import {DataLayerCustomerOrdersContainer} from 'bat-core/data-layer';
import {useIsPasswordOutdated} from 'bat-core/user';

import {AuthorizeSwitch, AccountSwitch} from '../../Router';
import {useMeiroTracker} from '../../common';

export const AccountPage = () => {
    const {path} = useRouteMatch();
    const {state} = useLocation();
    const history = useHistory();
    const {isSMdown} = useResolutions();
    const isAuthorized = useIsAuthorized();
    const isPasswordUpdated = !useIsPasswordOutdated();
    const {onSubmitAddressInfo} = useMeiroTracker();
    const {data: storeConfigData} = useStoreConfigQuery();

    const {from} = state || {};
    const infoNavigatePath = `${path}/info`;
    const securityNavigatePath = `${path}/security`;
    const addressesNavigatePath = `${path}/addresses`;
    const addAddressNavigatePath = `${path}/addresses/add`;
    const editAddressNavigatePath = `${path}/addresses/edit`;
    const ordersNavigatePath = `${path}/orders`;
    const couponsNavigatePath = `${path}/coupons`;
    const referralProgramNavigatePath = `${path}/referral-program`;
    const wishlistNavigatePath = `${path}/wishlist`;

    const onNavigateAccount = () => history.push(`${path}`);
    const onNavigateAccountAddresses = (resp) => {
        onSubmitAddressInfo(resp?.address);
        history.push(addressesNavigatePath);
    };
    const onNavigateAccountAddAddress = () => history.push(addAddressNavigatePath);
    const onNavigateAccountEditAddress = (addressId) => history.push(`${editAddressNavigatePath}/${addressId}`);
    const onNavigateAccountOrders = () => history.push(ordersNavigatePath);
    const onNavigateAccountOrder = (orderId) => history.push(`${ordersNavigatePath}/${orderId}`);
    const onLogout = () => history.push('/');
    const onNavigateForgotPassword = () => history.replace(`${path}/forgot-password`);
    const onNavigateCoupons = () => history.replace(couponsNavigatePath);
    const onNavigateReferralProgram = () => history.replace(referralProgramNavigatePath);
    const onNavigateWishlist = () => history.push(wishlistNavigatePath);

    const shouldReturnToCheckout = from === '/checkout';
    const isGtmEnabled = storeConfigData?.storeConfig?.is_gtm_enabled;

    return (
        <div className="account-page">
            {isAuthorized && isPasswordUpdated && !shouldReturnToCheckout ? (
                <div className="account-page-body">
                    {!isSMdown && (
                        <AccountMenuContainer accountPath={path}
                                              infoNavigatePath={infoNavigatePath}
                                              securityNavigatePath={securityNavigatePath}
                                              addressesNavigatePath={addressesNavigatePath}
                                              ordersNavigatePath={ordersNavigatePath}
                                              couponsNavigatePath={couponsNavigatePath}
                                              referralProgramNavigatePath={referralProgramNavigatePath}
                                              wishlistNavigatePath={wishlistNavigatePath}
                                              onLogout={onLogout}/>
                    )}
                    <div className="account-page-content">
                        <AccountSwitch accountPath={path}
                                       infoNavigatePath={infoNavigatePath}
                                       securityNavigatePath={securityNavigatePath}
                                       addressesNavigatePath={addressesNavigatePath}
                                       ordersNavigatePath={ordersNavigatePath}
                                       couponsNavigatePath={couponsNavigatePath}
                                       referralProgramNavigatePath={referralProgramNavigatePath}
                                       wishlistNavigatePath={wishlistNavigatePath}
                                       onNavigateAccount={onNavigateAccount}
                                       onNavigateAccountAddresses={onNavigateAccountAddresses}
                                       onNavigateAccountAddAddress={onNavigateAccountAddAddress}
                                       onNavigateAccountEditAddress={onNavigateAccountEditAddress}
                                       onNavigateAccountOrders={onNavigateAccountOrders}
                                       onNavigateAccountOrder={onNavigateAccountOrder}
                                       onLogout={onLogout}
                                       onNavigateForgotPassword={onNavigateForgotPassword}
                                       onNavigateCoupons={onNavigateCoupons}
                                       onNavigateReferralProgram={onNavigateReferralProgram}
                                       onNavigateWishlist={onNavigateWishlist}/>
                    </div>
                    {isGtmEnabled && <DataLayerCustomerOrdersContainer/>}
                </div>
            ) : (
                <div className="account-page-authorize">
                    <AuthorizeSwitch/>
                </div>
            )}
        </div>
    );
};
