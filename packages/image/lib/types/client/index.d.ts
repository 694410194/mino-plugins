import type { Context as ClientContext } from '@deepseek-ai/cordis';
import { type MinoImageKey } from './locales.js';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        /** Generated-image card, promoted row, and settings-page copy. */
        'mino-image': MinoImageKey;
    }
}
/** Required browser services for the registrations and dictionaries. */
export declare const inject: string[];
/** Mount the dictionaries, result row, tool cards, and the settings card. */
export declare function apply(ctx: ClientContext): void;
