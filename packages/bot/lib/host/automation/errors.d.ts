import { RemoteError } from '@deepseek-ai/dsh-typert-protocol';
import type { z } from 'zod';
export type AutomationErrorCode = 'automation/invalid' | 'automation/conflict' | 'automation/not-found' | 'automation/unavailable';
declare module '@deepseek-ai/dsh-typert-protocol' {
    interface RemoteErrorDetailsMap {
        'automation/invalid': Record<string, never>;
        'automation/conflict': Record<string, never>;
        'automation/not-found': Record<string, never>;
        'automation/unavailable': Record<string, never>;
    }
}
export declare class AutomationError extends RemoteError<AutomationErrorCode> {
    constructor(code: AutomationErrorCode, message: string, options?: ErrorOptions);
}
export declare function parse<S extends z.ZodType>(schema: S, input: unknown): z.output<S>;
export declare function unavailable(error: unknown): AutomationError;
