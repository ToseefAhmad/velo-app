import React, {useEffect} from 'react';
import {useLocation} from 'react-router';
import type {ComponentType} from 'react';

import {useViewerQuery} from '@luft/user';

import {MeiroTrackerComponent} from '../MeiroTracker.component';
import {useMeiroTracker} from '../../hooks';

type Props = {
    as?: ComponentType<{}>
};

export function MeiroTrackerContainer(props: Props) {
    const {as: Component = MeiroTrackerComponent, ...others} = props;

    const {onVisitPage} = useMeiroTracker();
    const {pathname} = useLocation();
    const q = useViewerQuery();

    const userId = q.data?.viewer?.user?.id;

    useEffect(() => {
        onVisitPage(userId);
    }, [pathname]);

    return Component && <Component {...others}/>;
}
