import { usePageTitle } from 'hooks/usePageTitle';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useProjectNameOrId } from 'hooks/api/getters/useProject/useProject';
import { ChangeRequestsTabs } from './ChangeRequestsTabs/ChangeRequestsTabs';
import { useProjectChangeRequests } from 'hooks/api/getters/useProjectChangeRequests/useProjectChangeRequests';

export const ProjectChangeRequests = () => {
    const projectId = useRequiredPathParam('projectId');
    const projectName = useProjectNameOrId(projectId);

    usePageTitle(`Change requests – ${projectName}`);

    const { changeRequests, loading } = useProjectChangeRequests(projectId);

    return (
        <ChangeRequestsTabs
            changeRequests={changeRequests}
            projectId={projectId}
            loading={loading}
        />
    );
};
