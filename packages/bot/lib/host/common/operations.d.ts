import { RemoteError } from '@deepseek-ai/dsh-typert-protocol';
import type { z } from 'zod';
import { type OperationCode, type OperationErrorCode } from '../../shared/operation-errors.js';
export type { OperationCode } from '../../shared/operation-errors.js';
export declare class OperationError extends RemoteError<OperationErrorCode> {
    constructor(code: OperationCode);
}
export declare function parse<S extends z.ZodType>(schema: S, value: unknown): z.output<S>;
export declare const digest: (v: unknown) => string;
export declare class Serial {
    private tail;
    private stopped;
    run<T>(fn: () => Promise<T>): Promise<T>;
    close(): Promise<void>;
}
type OperationErrors = {
    [K in OperationErrorCode]: Record<string, never>;
};
declare module '@deepseek-ai/dsh-typert-protocol' {
    interface RemoteErrorDetailsMap extends OperationErrors {
    }
}
export declare function need<T>(value: T | undefined): T;
