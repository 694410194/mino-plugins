import { type DataLabel } from '../../shared/data-flow.js';
import { type BotKey } from '../../shared/identity.js';
export declare const unknownLabel: () => DataLabel;
/** Meet of permissions, union of provenance/restrictions. Grants never broaden on merge. */
export declare function mergeLabels(...inputs: DataLabel[]): DataLabel;
export declare const canReadLabel: (label: DataLabel, bot: BotKey) => boolean;
