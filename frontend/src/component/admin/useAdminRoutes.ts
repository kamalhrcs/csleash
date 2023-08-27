import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { adminRoutes } from './adminRoutes';
import { mapRouteLink } from 'component/common/util';

export const useAdminRoutes = () => {
    const { uiConfig } = useUiConfig();
    const routes = [...adminRoutes];

    if (uiConfig.flags.UNLEASH_CLOUD) {
        const adminBillingMenuItem = adminRoutes.findIndex(
            route => route.title === 'Billing & invoices'
        );
        routes[adminBillingMenuItem] = {
            ...routes[adminBillingMenuItem],
            path: '/admin/billing',
        };
    }

    return (
        routes
            // .filter(filterByConfig(uiConfig))
            // .filter(route =>
            //     filterAdminRoutes(route?.menu, {
            //         enterprise: isEnterprise(),
            //         pro: isPro(),
            //         billing: isBilling,
            //     })
            // )
            .map(mapRouteLink)
    );
};
