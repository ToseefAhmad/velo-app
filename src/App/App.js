import './App.scss';

import React, {
    useState,
    useEffect,
    useRef
} from 'react';
import {
    Route,
    useHistory,
    useRouteMatch
} from 'react-router-dom';
import {useIntl} from 'react-intl';

import {ToastComponent} from '@luft/common';
import {useWarmMenuAndFirstPageCache} from '@luft/catalog';
import {useOnSessionExpired, useIsAuthorized} from '@luft/user';
import {UrlResolverSwitch} from '@luft/url-resolver';
import {isProduction} from '@luft/util';

import {EspayContainer} from 'bat-core/espay';
import {CcAvenuePaymentResultContainer} from 'bat-core/ccavenue';
import {RestrictAccessAdvancedContainer} from 'bat-core/restrict-access';
import {MiniCartTransitionComponent} from 'bat-core/cart';
import {FreeGiftContainer} from 'bat-core/free-gift';
import {UpdatePasswordContainer, useIsPasswordOutdated} from 'bat-core/user';
import {PushNotificationModalContainer} from 'bat-core/push-notification';
import {UrlResolverRoute} from 'bat-core/url-resolver';
import {
    MetaComponent,
    GoogleOptimizeComponent,
    useManifest,
    isPrerenderBot,
    getStoreCodeByPathname
} from 'bat-core/common';
import {SalesforceChatContainer, useCalcLiveChatPosition} from 'bat-core/live-chat';
import {DataLayerPageVisitContainer} from 'bat-core/data-layer';
import {useInitializeGtm} from 'bat-core/boot';
import {initContentTypeConfigs} from 'bat-core/page-builder';

import {
    AppHeader,
    AppFooter,
    MeiroTrackerContainer
} from '../common';
import {RedirectsSwitch} from '../Router';
import {AccountPage} from '../pages/AccountPage';
import {CartPage} from '../pages/CartPage';
import {CategoryPage} from '../pages/CategoryPage';
import {CheckoutPage} from '../pages/CheckoutPage';
import {CmsPage} from '../pages/CmsPage';
import {ProductPage} from '../pages/ProductPage';
import {ProductSearchPage} from '../pages/ProductSearchPage';
import {UserSocialLoginPage} from '../pages/UserSocialLoginPage';
import {StoreLocatorPage} from '../pages/StoreLocatorPage';
import {BlogPage} from '../pages/BlogPage';
import {BlogPostPage} from '../pages/BlogPostPage';
import {ContactUsPage} from '../pages/ContactUsPage';
import {NoMatchPage} from '../pages/NoMatchPage';

import messages from './resources/messages';

const SLIDER_SIZES = {
    desktop: {
        width: 1260,
        height: 220
    },
    mobile: {
        width: 370,
        height: 220
    }
};

initContentTypeConfigs({slider: SLIDER_SIZES});

type HomepageMeta = {
    title: string
};

type Props = {
    storeConfig: {
        is_minicart_enabled: boolean,
        is_push_notification_enabled: boolean,
        google_opt_enabled?: boolean,
        google_opt_container_id?: string,
        is_gtm_enabled: boolean,
        gtm_container_id: string,
        gtm_authorization_key: string,
        gtm_preview: string,
        sl_enabled: boolean,
        is_blog_enabled: boolean,
        mfblog_homepage_related_posts_enabled: boolean,
        mfblog_homepage_related_posts_number_of_posts: number,
        base_currency_code: string,
        homepage_meta: HomepageMeta,
        salesforce_chat_enabled: boolean,
        meta_robots: string,
        logo_url: string,
        web_to_case_enabled: boolean,
        hubspot_contact_us_form_enabled: boolean
    },
    showCmsHomePage?: boolean
};

export function App({
    storeConfig
}: Props) {
    const {
        is_minicart_enabled,
        is_push_notification_enabled,
        google_opt_enabled,
        google_opt_container_id,
        is_gtm_enabled,
        gtm_container_id,
        gtm_authorization_key,
        gtm_preview,
        sl_enabled,
        is_blog_enabled,
        mfblog_homepage_related_posts_enabled,
        mfblog_homepage_related_posts_number_of_posts,
        base_currency_code,
        homepage_meta,
        salesforce_chat_enabled,
        meta_robots,
        logo_url,
        web_to_case_enabled,
        hubspot_contact_us_form_enabled
    } = storeConfig || {};

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const addToCartPanelRef = useRef(null);
    const initialWarming = useWarmMenuAndFirstPageCache();
    const {liveChatPosition} = useCalcLiveChatPosition(addToCartPanelRef);
    const history = useHistory();
    const {formatMessage} = useIntl();
    const shouldRenderFreeGift = !!useRouteMatch(['/cart', '/checkout']);
    const isAuthorized = useIsAuthorized();
    const isPasswordOutdated = useIsPasswordOutdated();

    const isBlogWidgetEnabled = is_blog_enabled && mfblog_homepage_related_posts_enabled;
    const isIndonesia = getStoreCodeByPathname() === 'id';
    const hasContactUsPageRoute = web_to_case_enabled || hubspot_contact_us_form_enabled;
    const shouldUpdatePassword = isAuthorized && isPasswordOutdated;

    useInitializeGtm({
        enabled: is_gtm_enabled,
        gtmId: gtm_container_id,
        auth: gtm_authorization_key,
        preview: gtm_preview
    });

    useManifest();
    useOnSessionExpired(() => history.push('/account/login', {isExpired: true}));
    useEffect(() => {
        if (isPrerenderBot) return;

        initialWarming();
    }, []);

    return (
        <div className="app">
            <MetaComponent meta={{
                meta_title: formatMessage(messages.meta_title),
                meta_description: formatMessage(messages.meta_description),
                meta_robots
            }}/>
            {/* Custom CMS url redirects to Luft defaults */}
            <RedirectsSwitch/>

            <AppHeader title="VELO"
                       isMenuOpen={isMenuOpen}
                       isPushNotificationEnabled={is_push_notification_enabled}
                       isStoreLocatorEnabled={sl_enabled}
                       onMenuToggle={setIsMenuOpen}
                       logoUrl={logo_url}/>

            <div className="app-content">
                <UrlResolverSwitch>
                    {/* Overwrite Website root CMS page */}
                    <Route path="/search"
                           render={() => <ProductSearchPage metaDescription={homepage_meta?.title}/>}/>
                    <Route path="/cart"
                           render={() => <CartPage metaDescription={homepage_meta?.title}/>}/>
                    <Route path="/account"
                           component={AccountPage}/>
                    <Route path="/checkout"
                           render={() => <CheckoutPage metaDescription={homepage_meta?.title}/>}/>
                    <Route path="/espay/process"
                           exact={true}
                           component={EspayContainer}/>
                    <Route path="/ccavenue/result/index/token/:token"
                           component={CcAvenuePaymentResultContainer}/>
                    <Route path="/connect/social-login"
                           component={UserSocialLoginPage}/>
                    {sl_enabled && <Route path="/store-locator"
                                          component={StoreLocatorPage}/>}
                    {hasContactUsPageRoute && (
                        <Route path="/contact-us"
                               component={ContactUsPage}/>
                    )}
                    {/* URL Resolver routes */}
                    <UrlResolverRoute entity="CMS_PAGE"
                                      render={(props) => (
                                          <CmsPage {...props}
                                                   brandName="VELO"
                                                   isBlogWidgetEnabled={isBlogWidgetEnabled}
                                                   numberOfPosts={mfblog_homepage_related_posts_number_of_posts}
                                                   logoUrl={logo_url}/>
                                      )}/>
                    <UrlResolverRoute entity="CATEGORY"
                                      render={(props) => (
                                          <CategoryPage {...props}
                                                        onBack={() => setIsMenuOpen(true)}/>
                                      )}/>
                    <UrlResolverRoute entity="PRODUCT"
                                      render={(props) => (
                                          <ProductPage {...props}
                                                       addToCartRef={addToCartPanelRef}/>
                                      )}/>
                    {is_blog_enabled && (
                        <UrlResolverRoute entity="MF_BLOG_POST"
                                          component={BlogPostPage}/>
                    )}
                    {is_blog_enabled && (
                        <UrlResolverRoute entity="MF_BLOG_INDEX"
                                          component={BlogPage}/>
                    )}
                    {/* Routes, that can be overwritten by Url Rewrite */}
                    <Route path="*"
                           component={NoMatchPage}/>
                </UrlResolverSwitch>
            </div>

            <AppFooter/>
            <RestrictAccessAdvancedContainer/>
            <ToastComponent/>

            {shouldUpdatePassword && <UpdatePasswordContainer/>}
            {is_gtm_enabled && <DataLayerPageVisitContainer/>}
            {shouldRenderFreeGift && <FreeGiftContainer/>}
            {is_minicart_enabled && <MiniCartTransitionComponent baseCurrencyCode={base_currency_code}/>}
            {salesforce_chat_enabled && <SalesforceChatContainer position={liveChatPosition}/>}
            {isProduction() && isIndonesia && <MeiroTrackerContainer/>}
            {is_push_notification_enabled && <PushNotificationModalContainer brandName="VELO"/>}
            {google_opt_enabled && <GoogleOptimizeComponent containerId={google_opt_container_id}/>}
        </div>
    );
}
