import { FromSchema } from 'json-schema-to-ts';
import { segmentSchema } from './segment-schema';
import { userSchema } from './user-schema';

export const segmentsSchema = {
    $id: '#/components/schemas/segmentsSchema',
    type: 'object',
    additionalProperties: false,
    description:
        'A list of [user segments](https://docs.getunleash.io/reference/rbac#user-segments)',
    properties: {
        segments: {
            description: 'A list of segments',
            type: 'array',
            items: {
                $ref: '#/components/schemas/segmentSchema',
            },
        },
    },
    components: {
        schemas: {
            segmentSchema,
            userSchema,
        },
    },
} as const;

export type SegmentsSchema = FromSchema<typeof segmentsSchema>;
