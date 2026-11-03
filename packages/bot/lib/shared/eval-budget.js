import { z } from 'zod';
const count = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
export const usageSchema = z.strictObject({ calls: count, input: count, output: count, money: count });
export const priceSchema = z.strictObject({
    version: z.string().min(1), model: z.string().min(1), source: z.literal('synthetic'),
    call: count, input: count, output: count,
});
export const reservationInputSchema = z.strictObject({
    id: z.string().min(1), runId: z.string().min(1), caseId: z.string().min(1), attempt: count.min(1),
    model: z.string().min(1), priceVersion: z.string().min(1),
    calls: count.min(1), inputCeiling: count, outputCeiling: count, moneyCeiling: count,
});
export const reservationSchema = reservationInputSchema.extend({
    state: z.enum(['reserved', 'settled', 'unknown']), actual: usageSchema.optional(),
}).superRefine((row, ctx) => {
    if ((row.state === 'settled') !== (row.actual !== undefined))
        ctx.addIssue({ code: 'custom', message: 'Invalid settlement' });
});
export const ledgerSchema = z.strictObject({
    version: z.literal(1), limits: usageSchema, price: priceSchema, reservations: z.array(reservationSchema), blocked: z.boolean().optional(),
});
export const zeroUsage = () => ({ calls: 0, input: 0, output: 0, money: 0 });
export function addUsage(a, b) {
    return usageSchema.parse({ calls: a.calls + b.calls, input: a.input + b.input, output: a.output + b.output, money: a.money + b.money });
}
export const within = (a, b) => Object.keys(a).every(key => a[key] <= b[key]);
export function charge(price, calls, input, output) {
    return usageSchema.parse({ calls, input, output, money: calls * price.call + input * price.input + output * price.output });
}
export const ceiling = (row) => ({
    calls: row.calls, input: row.inputCeiling, output: row.outputCeiling, money: row.moneyCeiling,
});
//# sourceMappingURL=eval-budget.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
