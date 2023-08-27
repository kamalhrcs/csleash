import { useLocation } from 'react-router-dom';
import { Paper, styled, Tab, Tabs } from '@mui/material';
import { CenteredNavLink } from './CenteredNavLink';
import { VFC } from 'react';
import { useAdminRoutes } from '../useAdminRoutes';

const StyledPaper = styled(Paper)(({ theme }) => ({
    marginBottom: '1rem',
    borderRadius: `${theme.shape.borderRadiusLarge}px`,
    boxShadow: 'none',
    padding: theme.spacing(0, 2),
}));


export const AdminTabsMenu: VFC = () => {
    const { pathname } = useLocation();

    const activeTab = pathname.split('/')[2];

    const adminRoutes = useAdminRoutes();
    const group = adminRoutes.find(route =>
        pathname.includes(route.path)
    )?.group;

    const tabs = adminRoutes.filter(
        route =>
            !group ||
            route.group === group ||
            (true && route.group !== 'log')
    );

    if (!group) {
        return null;
    }

    return (
        <StyledPaper>
            <Tabs
                value={activeTab}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
            >
                {tabs.map(tab => (
                    <Tab
                        sx={{ padding: 0 }}
                        key={tab.route}
                        value={tab.route?.split('/')?.[2]}
                        label={
                            <CenteredNavLink to={tab.path}>
                                {tab.title}
                            </CenteredNavLink>
                        }
                    />
                ))}
            </Tabs>
        </StyledPaper>
    );
};
