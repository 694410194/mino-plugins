import { digest } from '../common/operations.js';
/** Replay the complete durable log, never a compressed context window. */
export function messageEvidence(record, events) {
    const queues = {
        'next-turn': [],
        'next-step': [],
    };
    const expected = record.nativeInput;
    const id = expected?.id ?? record.nativeRef?.messageId;
    let inserted = false, canceled = false, claimed = false, seq, turn, currentTurn, ended = false, interrupted = false, crashClosed = false, assistant = false;
    for (let i = 0; i < events.length; i++) {
        const e = events[i];
        if (!e || Number(e.seq) !== i)
            throw Error('Incomplete session log');
        if (e.type === 'turn/start')
            currentTurn = e.data.turn;
        if (e.type === 'agent/inbox/spliced') {
            const s = e.data, q = queues[s.target];
            if (s.start < 0 || s.start > q.length || s.start + (s.removedCount ?? 0) > q.length)
                throw Error('Invalid inbox history');
            for (const m of s.inserted)
                if (m.id === id) {
                    inserted = true;
                    if (expected && digest(m) !== digest(expected))
                        throw Error('Message identity conflict');
                }
            const removed = q.splice(s.start, s.removedCount ?? 0, ...s.inserted.map((m) => m.id));
            if (id && removed.includes(id)) {
                if (s.outcome === 'canceled')
                    canceled = true;
                else
                    claimed = true;
            }
        }
        if (e.type === 'user/message' && e.data.id === id) {
            if (expected && digest(e.data) !== digest(expected))
                throw Error('Message identity conflict');
            seq = Number(e.seq);
            turn = currentTurn;
        }
        if (turn !== undefined && currentTurn === turn && e.type === 'assistant/message')
            assistant = true;
        if (e.type === 'turn/end' && turn !== undefined && e.data.turn === turn) {
            ended = true;
            interrupted = e.data.reason.kind !== 'completed';
            crashClosed = e.data.reason.kind === 'interrupted';
        }
    }
    return {
        inserted,
        canceled,
        claimed,
        pending: Boolean(id && (queues['next-turn'].includes(id) || queues['next-step'].includes(id))),
        seq,
        turn,
        ended,
        interrupted,
        crashClosed,
        assistant,
    };
}
//# sourceMappingURL=evidence.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
