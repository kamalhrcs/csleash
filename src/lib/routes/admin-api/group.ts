import {
    CREATE_GROUP,
    DELETE_GROUP,
    NONE,
    UPDATE_GROUP,
} from '../../types/permissions';
import { Request, Response } from 'express';
import { IUnleashConfig } from '../../types/option';
import { IUnleashServices } from '../../types/services';
import Controller from '../controller';
import { Logger } from '../../logger';
import { GroupService, OpenApiService } from '../../services';
import { IAuthRequest } from '../unleash-types';
import {
    GroupSchema,
    GroupsSchema,
    createResponseSchema,
    emptyResponse,
    getStandardResponses,
    groupSchema,
    groupsSchema,
} from '../../openapi';
import { ICreateGroupModel, serializeDates } from '../../types';
import { extractUsername } from '../../util';

export default class GroupController extends Controller {
    private groupService: GroupService;

    private openApiService: OpenApiService;

    private logger: Logger;

    constructor(
        config: IUnleashConfig,
        {
            groupService,
            openApiService,
        }: Pick<IUnleashServices, 'groupService' | 'openApiService'>,
    ) {
        super(config);
        this.groupService = groupService;
        this.openApiService = openApiService;
        this.logger = config.getLogger('routes/admin-api/group');

        this.route({
            method: 'get',
            path: '',
            handler: this.getAllGroups,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Users'],
                    operationId: 'getAllGroups',
                    responses: {
                        200: createResponseSchema('groupsSchema'),
                        ...getStandardResponses(401, 403),
                    },
                    summary: 'Get all groups',
                    description:
                        'Get a list of user groups for Role-Based Access Control',
                }),
            ],
        });

        this.route({
            method: 'post',
            path: '',
            handler: this.createGroup,
            permission: CREATE_GROUP,
            middleware: [
                openApiService.validPath({
                    tags: ['Users'],
                    operationId: 'getAllGroups',
                    responses: {
                        200: createResponseSchema('groupSchema'),
                        ...getStandardResponses(400, 401, 403),
                    },
                    summary: 'Create a new user group',
                    description:
                        'Create a new user group for Role-Based Access Control',
                }),
            ],
        });

        this.route({
            method: 'get',
            path: '/:groupId',
            handler: this.getGroup,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Users'],
                    operationId: 'getGroup',
                    responses: {
                        200: createResponseSchema('groupSchema'),
                        ...getStandardResponses(400, 401, 403),
                    },
                    summary: 'Get a single user group by group id',
                    description: 'Get a single user group by group id',
                }),
            ],
        });

        this.route({
            method: 'put',
            path: '/:groupId',
            handler: this.updateGroup,
            permission: UPDATE_GROUP,
            middleware: [
                openApiService.validPath({
                    tags: ['Users'],
                    operationId: 'updateGroup',
                    responses: {
                        200: createResponseSchema('groupSchema'),
                        ...getStandardResponses(400, 401, 403),
                    },
                    summary:
                        'Update existing user group by group id. It overrides previous group details.',
                    description:
                        'Update existing user group by group id. It overrides previous group details.',
                }),
            ],
        });

        this.route({
            method: 'delete',
            path: '/:groupId',
            handler: this.deleteGroup,
            permission: DELETE_GROUP,
            middleware: [
                openApiService.validPath({
                    tags: ['Users'],
                    operationId: 'deleteGroup',
                    responses: {
                        200: emptyResponse,
                        ...getStandardResponses(400, 401, 403),
                    },
                    summary: 'Delete a single user group by group id.',
                    description: 'Delete a single user group by group id.',
                }),
            ],
        });
    }

    async getAllGroups(
        req: IAuthRequest,
        res: Response<GroupsSchema>,
    ): Promise<void> {
        const groups = await this.groupService.getAll();

        this.openApiService.respondWithValidation(200, res, groupsSchema.$id, {
            groups: serializeDates(groups),
        });
    }

    async getGroup(
        req: IAuthRequest<{ groupId: number }>,
        res: Response<GroupSchema>,
    ): Promise<void> {
        const { groupId } = req.params;
        const group = await this.groupService.getGroup(groupId);

        this.openApiService.respondWithValidation(
            200,
            res,
            groupSchema.$id,
            serializeDates(group),
        );
    }

    async updateGroup(
        req: IAuthRequest<{ groupId: number }, GroupSchema>,
        res: Response<GroupSchema>,
    ): Promise<void> {
        const { groupId } = req.params;
        const group = req.body;
        group.id = groupId;
        const userName = extractUsername(req);

        const updatedGroup = await this.groupService.updateGroup(
            group,
            userName,
        );

        this.openApiService.respondWithValidation(
            200,
            res,
            groupSchema.$id,
            serializeDates(updatedGroup),
        );
    }

    async createGroup(
        req: IAuthRequest<unknown, GroupSchema, ICreateGroupModel, unknown>,
        res: Response<GroupSchema>,
    ): Promise<void> {
        const group = req.body;
        const userName = extractUsername(req);

        const newGroup = await this.groupService.createGroup(group, userName);

        this.openApiService.respondWithValidation(
            200,
            res,
            groupSchema.$id,
            serializeDates(newGroup),
        );
    }

    async deleteGroup(
        req: IAuthRequest<{ groupId: number }>,
        res: Response,
    ): Promise<void> {
        const { groupId } = req.params;
        const group = await this.groupService.deleteGroup(groupId);

        res.status(200).end();
    }
}
module.exports = GroupController;
