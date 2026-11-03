import { RemoteError } from '@deepseek-ai/dsh-typert-protocol';
import type { z } from 'zod';
export type DshBotErrorCode = 'bot/not-found' | 'bot/conflict' | 'bot/invalid' | 'memory/not-found' | 'memory/too-large' | 'memory/rejected' | 'store/unavailable' | 'activity/not-found' | 'bot/preset-failed' | 'bot/rollback-failed' | 'bot/unavailable' | 'bot/home-cleanup-failed';
/** Preserve the Store's error vocabulary while using DSH's actual wire error. */
export declare class DshBotError extends RemoteError<DshBotErrorCode> {
    readonly name = "DshBotError";
    constructor(code: DshBotErrorCode, message: string, options?: ErrorOptions);
}
export declare function parseInput<S extends z.ZodType>(schema: S, input: unknown): z.output<S>;
