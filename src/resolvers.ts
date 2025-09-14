import { z } from 'zod';
import type { IResolvers } from '@graphql-tools/utils';
import { enqueueRegression } from './executor.js';
import { JobStore, ModelStore } from './store.js';
import type { StartRegressionInput } from './types.js';

const StartInputSchema = z.object({
    data: z.array(z.object({ x: z.number(), y: z.number() })).nonempty(),
    kind: z.enum(['LINEAR', 'LASSO', 'RIDGE']),
    alpha: z.number().positive().optional()
}).superRefine((val, ctx) => {
    if (val.kind !== 'LINEAR' && (val.alpha === undefined || val.alpha === null)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['alpha'], message: 'alpha is required for LASSO and RIDGE' });
    }
});


export const resolvers: IResolvers = {
    Query: {
        job: (_p, { id }: { id: string }) => JobStore.get(id) ?? null,
        model: (_p, { id }: { id: string }) => ModelStore.get(id) ?? null,
    },
    Mutation: {
        startRegression: async (_p, { input }: { input: StartRegressionInput }) => {
            const parsed = StartInputSchema.parse(input);
            return enqueueRegression(parsed);
        }
    },
    Model: {
        predict: (model, { x }: { x: number }) => {
            // return x + 1
            return x + 1;
        }
    }
};