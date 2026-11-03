import { z } from 'zod';
import { routineOutcomeSchema } from '../../shared/routine-outcomes.js';
const stateSchema = z.strictObject({ open: z.number().int().nullable(), records: z.array(routineOutcomeSchema) });
export function routineOutcomes(limit) {
    return {
        key: 'dshBotRoutineOutcomes', stateVersion: limit, stateSchema,
        init: () => ({ open: null, records: [] }),
        apply(state, event) {
            if (event.type === 'turn/start')
                return { ...state, open: event.data.turn };
            if (event.type === 'user/message' && event.surfaceOp === 'append' && event.data.source.kind === 'schedule' && state.open !== null) {
                if (state.records.some(row => row.messageId === event.data.id))
                    return state;
                return { ...state, records: [...state.records, {
                            messageId: event.data.id, turn: state.open, state: 'processing', at: event.time,
                        }].slice(-limit) };
            }
            if (event.type !== 'turn/end')
                return state;
            const kind = event.data.reason.kind;
            const outcome = kind === 'completed' ? 'responded'
                : kind === 'aborted' || kind === 'interrupted' ? 'stopped'
                    : kind === 'error' || kind === 'blocked' ? 'failed'
                        : kind === 'max-tokens' ? 'limited' : 'unknown';
            return { open: state.open === event.data.turn ? null : state.open, records: state.records.map(row => row.turn === event.data.turn && row.state === 'processing' ? { ...row, state: outcome, at: event.time } : row) };
        },
        wire: { viewSchema: z.array(routineOutcomeSchema), view: state => state.records },
    };
}
//# sourceMappingURL=outcomes.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
