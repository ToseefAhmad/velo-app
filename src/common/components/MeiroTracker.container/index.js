import loadable from '@loadable/component';

export const MeiroTrackerContainer = loadable(() => import('./MeiroTracker.container'), {
    resolveComponent: module => module.MeiroTrackerContainer
});
