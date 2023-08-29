import {
    CREATE_SEGMENT,
    DELETE_SEGMENT,
    NONE,
    UPDATE_SEGMENT,
} from '../../types/permissions';
import { Request, Response } from 'express';
import { IUnleashConfig } from '../../types/option';
import { IUnleashServices } from '../../types/services';
import Controller from '../controller';
import { Logger } from '../../logger';
import { OpenApiService, SegmentService } from '../../services';
import { IAuthRequest } from '../unleash-types';
import {
    SegmentSchema,
    SegmentsSchema,
    UpsertSegmentSchema,
    createResponseSchema,
    emptyResponse,
    getStandardResponses,
    segmentSchema,
    segmentsSchema,
} from '../../openapi';
import { serializeDates } from '../../types';
import { ISegmentService } from '../../segments/segment-service-interface';

export default class SegmentController extends Controller {
    private segmentService: ISegmentService;

    private openApiService: OpenApiService;

    private logger: Logger;

    constructor(
        config: IUnleashConfig,
        {
            segmentService,
            openApiService,
        }: Pick<IUnleashServices, 'segmentService' | 'openApiService'>,
    ) {
        super(config);
        this.segmentService = segmentService;
        this.openApiService = openApiService;
        this.logger = config.getLogger('routes/admin-api/segment');

        this.route({
            method: 'get',
            path: '',
            handler: this.getAllSegments,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Users'],
                    operationId: 'getAllSegments',
                    responses: {
                        200: createResponseSchema('segmentsSchema'),
                        ...getStandardResponses(401, 403),
                    },
                    summary: 'Get all segments',
                    description:
                        'Get a list of user segments for Role-Based Access Control',
                }),
            ],
        });

        this.route({
            path: '/validate',
            method: 'post',
            handler: this.validateSegmentId,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Segments'],
                    operationId: 'validateSegmentId',
                    summary: 'Validate a segmentId.',
                    responses: {
                        200: emptyResponse,
                        ...getStandardResponses(401, 403),
                    },
                }),
            ],
        });

        this.route({
            method: 'post',
            path: '',
            handler: this.createSegment,
            permission: CREATE_SEGMENT,
            middleware: [
                openApiService.validPath({
                    tags: ['Users'],
                    operationId: 'getAllSegments',
                    responses: {
                        200: createResponseSchema('segmentSchema'),
                        ...getStandardResponses(400, 401, 403),
                    },
                    summary: 'Create a new user segment',
                    description:
                        'Create a new user segment for Role-Based Access Control',
                }),
            ],
        });

        this.route({
            method: 'get',
            path: '/:segmentId',
            handler: this.getSegment,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Users'],
                    operationId: 'getSegment',
                    responses: {
                        200: createResponseSchema('segmentSchema'),
                        ...getStandardResponses(400, 401, 403),
                    },
                    summary: 'Get a single user segment by segment id',
                    description: 'Get a single user segment by segment id',
                }),
            ],
        });

        this.route({
            method: 'put',
            path: '/:segmentId',
            handler: this.updateSegment,
            permission: UPDATE_SEGMENT,
            middleware: [
                openApiService.validPath({
                    tags: ['Users'],
                    operationId: 'updateSegment',
                    responses: {
                        200: createResponseSchema('segmentSchema'),
                        ...getStandardResponses(400, 401, 403),
                    },
                    summary:
                        'Update existing user segment by segment id. It overrides previous segment details.',
                    description:
                        'Update existing user segment by segment id. It overrides previous segment details.',
                }),
            ],
        });

        this.route({
            method: 'delete',
            path: '/:segmentId',
            handler: this.deleteSegment,
            permission: DELETE_SEGMENT,
            middleware: [
                openApiService.validPath({
                    tags: ['Users'],
                    operationId: 'deleteSegment',
                    responses: {
                        200: emptyResponse,
                        ...getStandardResponses(400, 401, 403),
                    },
                    summary: 'Delete a single user segment by segment id.',
                    description: 'Delete a single user segment by segment id.',
                }),
            ],
        });
    }

    async validateSegmentId(
        req: IAuthRequest<unknown, unknown, { name: string }>,
        res: Response,
    ): Promise<void> {
        const { name } = req.body;

        this.segmentService.validateName(name);

        res.end();
    }

    async getAllSegments(
        req: IAuthRequest,
        res: Response<unknown>,
    ): Promise<void> {
        const segments = await this.segmentService.getAll();

        this.openApiService.respondWithValidation(
            200,
            res,
            segmentsSchema.$id,
            {
                segments: serializeDates(segments),
            },
        );
    }

    async getSegment(
        req: IAuthRequest<{ segmentId: number }>,
        res: Response<SegmentSchema>,
    ): Promise<void> {
        const { segmentId } = req.params;
        const segment = await this.segmentService.get(segmentId);

        this.openApiService.respondWithValidation(
            200,
            res,
            segmentSchema.$id,
            serializeDates(segment),
        );
    }

    async updateSegment(
        req: IAuthRequest<{ segmentId: number }, SegmentSchema>,
        res: Response<SegmentSchema>,
    ): Promise<void> {
        const { segmentId } = req.params;
        const segment = req.body;
        segment.id = segmentId;
        const user = req.user;

        await this.segmentService.update(segmentId, segment, user);

        res.status(200).end();
    }

    async createSegment(
        req: IAuthRequest<unknown, SegmentSchema, UpsertSegmentSchema, unknown>,
        res: Response<SegmentSchema>,
    ): Promise<void> {
        const segment = req.body;
        const user = req.user;

        const newSegment = await this.segmentService.create(segment, user);

        this.openApiService.respondWithValidation(
            200,
            res,
            segmentSchema.$id,
            serializeDates(newSegment),
        );
    }

    async deleteSegment(
        req: IAuthRequest<{ segmentId: number }>,
        res: Response,
    ): Promise<void> {
        const { segmentId } = req.params;
        const user = req.user;
        const segment = await this.segmentService.delete(segmentId, user);

        res.status(200).end();
    }
}
module.exports = SegmentController;
