/** Mino image-generation plugin: conversation image tools billed through the account. */
import type { Context } from '@deepseek-ai/cordis';
import { Config } from './config.js';
import { DELETE_ROUTE, GENERATE_ROUTE, IMAGE_ROUTE, SAVE_WORKSPACE_ROUTE } from './shared.js';
import { imageAttachmentFromMeta } from './image-route.js';
export { Config } from './config.js';
export { DELETE_ROUTE, GENERATE_ROUTE, IMAGE_ROUTE, SAVE_WORKSPACE_ROUTE, imageAttachmentFromMeta };
export declare const name = "dsh-image-gen";
export declare const inject: string[];
export declare function apply(ctx: Context, config?: Config): void;
