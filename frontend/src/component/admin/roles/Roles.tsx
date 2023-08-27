import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { PermissionGuard } from 'component/common/PermissionGuard/PermissionGuard';
import { READ_ROLE } from '@server/types/permissions';
import { RolesPage } from './RolesPage';

export const Roles = () => {

    return (
        <div>
            <PermissionGuard permissions={[READ_ROLE, ADMIN]}>
                <RolesPage />
            </PermissionGuard>
        </div>
    );
};
