import type { Context } from '@deepseek-ai/cordis';
import { type ImStatus } from '../../shared/collaboration.js';
/** No import of dsh-im internals and no probing real accounts/credentials. */
export declare function imStatus(ctx: Context): ImStatus;
