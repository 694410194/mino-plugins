import { createHash } from 'node:crypto';
import { RemoteError } from '@deepseek-ai/dsh-typert-protocol';
import { OPERATION_CODES } from '../../shared/operation-errors.js';
export class OperationError extends RemoteError {
    constructor(code) {
        super(OPERATION_CODES[code], `DSH-Bot: ${code}`, {});
    }
}
export function parse(schema, value) {
    const result = schema.safeParse(value);
    if (!result.success)
        throw new OperationError('invalid');
    return result.data;
}
// Inputs have a fixed schema/key order before hashing; never hash secret values.
export const digest = (v) => createHash('sha256').update(JSON.stringify(v)).digest('hex');
export class Serial {
    tail = Promise.resolve();
    stopped = false;
    run(fn) {
        if (this.stopped)
            return Promise.reject(new OperationError('unavailable'));
        const next = this.tail.then(fn);
        this.tail = next.catch(() => { });
        return next;
    }
    async close() {
        this.stopped = true;
        await this.tail;
    }
}
export function need(value) {
    if (value === undefined)
        throw new OperationError('unavailable');
    return value;
}
//# sourceMappingURL=operations.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
