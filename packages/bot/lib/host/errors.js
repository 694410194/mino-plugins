import { RemoteError } from '@deepseek-ai/dsh-typert-protocol';
/** Preserve the Store's error vocabulary while using DSH's actual wire error. */
export class DshBotError extends RemoteError {
    name = 'DshBotError';
    constructor(code, message, options) {
        super(code, message, {}, options);
    }
}
export function parseInput(schema, input) {
    const result = schema.safeParse(input);
    if (result.success)
        return result.data;
    const tooLarge = result.error.issues.some((issue) => issue.code === 'custom' && issue.params?.code === 'memory/too-large');
    throw new DshBotError(tooLarge ? 'memory/too-large' : 'bot/invalid', result.error.message, { cause: result.error });
}
//# sourceMappingURL=errors.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
