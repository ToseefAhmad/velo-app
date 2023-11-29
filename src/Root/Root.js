import React from 'react';

import {RestrictAccessProviderComponent} from 'bat-core/restrict-access/src/components/RestrictAccessProvider.component';

import {MicroApp} from '../MicroApp';
import {FullApp} from '../FullApp';

const {LUFT_APP_DATA_URI} = process.env;

const {origin} = new URL(LUFT_APP_DATA_URI);

const STORES = [
    {
        base_url: `${origin}/id/id`,
        base_name: '/id/id',
        locale: 'id-ID',
        code: null
    },
    {
        base_url: `${origin}/pk/en`,
        base_name: '/pk/en',
        locale: 'en-US',
        code: 'pk'
    },
    {
        base_url: `${origin}/ae/en`,
        base_name: '/ae/en',
        locale: 'en-US',
        code: 'uae'
    }
];

type Props = {
    /**
     * Application start url. Used in static router for ssr.
     */
    url?: string,
    /**
     * Apollo HTTP link uri. Used in ssr mode.
     */
    dataUri?: string,
    /**
     * if App should work in ssr mode.
     */
    ssr?: boolean,
    /**
     * Custom fetch instance for Apollo
     */
    fetch?: Object
};

export function Root(props: Props) {
    const {url, ...other} = props;

    return (
        <RestrictAccessProviderComponent url={url}
                                         stores={STORES}>
            <MicroApp url={url}
                      stores={STORES}/>
            <FullApp {...other}
                     url={url}
                     stores={STORES}/>
        </RestrictAccessProviderComponent>
    );
}
