import { Response } from 'express';
import Controller from '../../controller';
import {
    CREATE_PROJECT,
    DELETE_PROJECT,
    IArchivedQuery,
    IProject,
    IProjectParam,
    IUnleashConfig,
    IUnleashServices,
    NONE,
    serializeDates,
} from '../../../types';
import ProjectFeaturesController from './project-features';
import EnvironmentsController from './environments';
import ProjectHealthReport from './health-report';
import ProjectService from '../../../services/project-service';
import VariantsController from './variants';
import {
    createResponseSchema,
    ProjectDoraMetricsSchema,
    projectDoraMetricsSchema,
    ProjectOverviewSchema,
    projectOverviewSchema,
    projectsSchema,
    ProjectsSchema,
} from '../../../openapi';
import {
    emptyResponse,
    getStandardResponses,
} from '../../../openapi/util/standard-responses';
import { OpenApiService, SettingService } from '../../../services';
import { IAuthRequest } from '../../unleash-types';
import { ProjectApiTokenController } from './api-token';
import ProjectArchiveController from './project-archive';
import { createKnexTransactionStarter } from '../../../db/transaction';
import { Db } from '../../../db/db';
import { InvalidOperationError } from '../../../error';

export default class ProjectApi extends Controller {
    private projectService: ProjectService;

    private settingService: SettingService;

    private openApiService: OpenApiService;

    constructor(config: IUnleashConfig, services: IUnleashServices, db: Db) {
        super(config);
        this.projectService = services.projectService;
        this.openApiService = services.openApiService;
        this.settingService = services.settingService;

        this.route({
            path: '',
            method: 'get',
            handler: this.getProjects,
            permission: NONE,
            middleware: [
                services.openApiService.validPath({
                    tags: ['Projects'],
                    operationId: 'getProjects',
                    summary: 'Get a list of all projects.',
                    description:
                        'This endpoint returns an list of all the projects in the Unleash instance.',
                    responses: {
                        200: createResponseSchema('projectsSchema'),
                        ...getStandardResponses(401, 403),
                    },
                }),
            ],
        });

        this.route({
            path: '/validate',
            method: 'post',
            handler: this.validateProjectId,
            permission: CREATE_PROJECT,
            middleware: [
                services.openApiService.validPath({
                    tags: ['Projects'],
                    operationId: 'validateProjectId',
                    summary: 'Validate a projectId.',
                    description:
                        'This endpoint returns an list of all the projects in the Unleash instance.',
                    responses: {
                        200: emptyResponse,
                        ...getStandardResponses(401, 403),
                    },
                }),
            ],
        });

        this.route({
            method: 'get',
            path: '/:projectId',
            handler: this.getProjectOverview,
            permission: NONE,
            middleware: [
                services.openApiService.validPath({
                    tags: ['Projects'],
                    operationId: 'getProjectOverview',
                    summary: 'Get an overview of a project.',
                    description:
                        'This endpoint returns an overview of the specified projects stats, project health, number of members, which environments are configured, and the features in the project.',
                    responses: {
                        200: createResponseSchema('projectOverviewSchema'),
                        ...getStandardResponses(401, 403, 404),
                    },
                }),
            ],
        });

        this.route({
            method: 'get',
            path: '/:projectId/dora',
            handler: this.getProjectDora,
            permission: NONE,
            middleware: [
                services.openApiService.validPath({
                    tags: ['Projects'],
                    operationId: 'getProjectDora',
                    summary: 'Get an overview project dora metrics.',
                    description:
                        'This endpoint returns an overview of the specified dora metrics',
                    responses: {
                        200: createResponseSchema('projectDoraMetricsSchema'),
                        ...getStandardResponses(401, 403, 404),
                    },
                }),
            ],
        });

        this.route({
            method: 'post',
            path: '',
            handler: this.createProject,
            permission: CREATE_PROJECT,
            middleware: [
                services.openApiService.validPath({
                    tags: ['Projects'],
                    operationId: 'createProject',
                    summary: 'endpoint to create a new project',
                    description: 'endpoint to create a new project. ',
                    responses: {
                        200: createResponseSchema('projectSchema'),
                        ...getStandardResponses(401, 403, 404),
                    },
                }),
            ],
        });

        this.route({
            method: 'delete',
            path: '/:projectId',
            handler: this.deleteProject,
            permission: DELETE_PROJECT,
            middleware: [
                services.openApiService.validPath({
                    tags: ['Projects'],
                    operationId: 'deleteProject',
                    summary: 'Delete a project.',
                    description: 'This endpoint delete a project',
                    responses: {
                        200: emptyResponse,
                        ...getStandardResponses(401, 403, 404),
                    },
                }),
            ],
        });

        this.use(
            '/',
            new ProjectFeaturesController(
                config,
                services,
                createKnexTransactionStarter(db),
            ).router,
        );
        this.use('/', new EnvironmentsController(config, services).router);
        this.use('/', new ProjectHealthReport(config, services).router);
        this.use('/', new VariantsController(config, services).router);
        this.use('/', new ProjectApiTokenController(config, services).router);
        this.use('/', new ProjectArchiveController(config, services).router);
    }

    async getProjects(
        req: IAuthRequest,
        res: Response<ProjectsSchema>,
    ): Promise<void> {
        const { user } = req;
        const projects = await this.projectService.getProjects({}, user.id);

        this.openApiService.respondWithValidation(
            200,
            res,
            projectsSchema.$id,
            { version: 1, projects: serializeDates(projects) },
        );
    }

    async validateProjectId(
        req: IAuthRequest<unknown, { id: string }>,
        res: Response,
    ): Promise<void> {
        const { id } = req.body;

        this.projectService.validateId(id);

        res.end();
    }

    async getProjectOverview(
        req: IAuthRequest<IProjectParam, unknown, unknown, IArchivedQuery>,
        res: Response<ProjectOverviewSchema>,
    ): Promise<void> {
        const { projectId } = req.params;
        const { archived } = req.query;
        const { user } = req;
        const overview = await this.projectService.getProjectOverview(
            projectId,
            archived,
            user.id,
        );

        this.openApiService.respondWithValidation(
            200,
            res,
            projectOverviewSchema.$id,
            serializeDates(overview),
        );
    }

    async getProjectDora(
        req: IAuthRequest,
        res: Response<ProjectDoraMetricsSchema>,
    ): Promise<void> {
        if (this.config.flagResolver.isEnabled('doraMetrics')) {
            const { projectId } = req.params;

            const dora = await this.projectService.getDoraMetrics(projectId);

            this.openApiService.respondWithValidation(
                200,
                res,
                projectDoraMetricsSchema.$id,
                dora,
            );
        } else {
            throw new InvalidOperationError(
                'Feature dora metrics is not enabled',
            );
        }
    }

    async createProject(
        req: IAuthRequest<unknown, unknown, IProject, unknown>,
        res: Response<IProjectParam>,
    ): Promise<void> {
        const project = req.body;

        const { user } = req;

        this.projectService.validateId(project.id);

        const createdProject = await this.projectService.createProject(
            project,
            user,
        );

        res.status(201).send({ projectId: createdProject.id });
    }

    async deleteProject(
        req: IAuthRequest<IProjectParam>,
        res: Response,
    ): Promise<void> {
        const { projectId } = req.params;

        const { user } = req;

        const createdProject = await this.projectService.deleteProject(
            projectId,
            user,
        );

        res.status(200).end();
    }
}
