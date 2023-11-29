import React from 'react';
import Script from 'react-load-script';

import {useMeiroTracker} from '../../hooks';

export function MeiroTrackerComponent() {
    const {onVisitPage} = useMeiroTracker();

    const meiroEventsScript = () => {
        const config = {
            domain: 'me.bat.meiro.io',
            cross_domain_whitelist: ['https://www.dunhill.co.id/'],
            the_trade_desk: {
                pid: 'r6frfy6',
                gdpr: 0,
                gdpr_consent: ''
            }
        };

        window.MeiroEvents.init(config);
        onVisitPage();
    };

    return (
        <Script url="//sdk.me.bat.meiro.io"
                onError={() => console.log('MeiroEvents script is not loaded')}
                onLoad={meiroEventsScript}/>
    );
}
