import { RemoteError } from '@deepseek-ai/dsh-typert-protocol';
export class AutomationError extends RemoteError {
    constructor(code, message, options) {
        super(code, message, {}, options);
    }
}
export function parse(schema, input) {
    const result = schema.safeParse(input);
    if (!result.success)
        throw new AutomationError('automation/invalid', 'Invalid automation input', { cause: result.error });
    return result.data;
}
export function unavailable(error) {
    return error instanceof AutomationError
        ? error
        : new AutomationError('automation/unavailable', 'Automation storage unavailable', { cause: error });
}
//# sourceMappingURL=errors.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
