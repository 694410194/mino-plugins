export type { DshBotActivityMethods, DshBotActivityRemoteMethods, DshBotRemoteMethods, ActivityRecord, ActivitySession, ActivityListResult, BotChange, BotHome, BotsWorkspace, } from './shared/remote-contract.js';
export { ACTIVITY_HIDDEN_PREVIEW, isHiddenActivityPreview, type BotActivity } from './shared/activity.js';
export declare const TYPERT_REMOTE: import("@deepseek-ai/dsh-typert-protocol").TypertRemoteInfo<Readonly<Record<string, import("@deepseek-ai/dsh-typert-protocol").TypertRemoteMethod<object, unknown, "unary", never, unknown> | import("@deepseek-ai/dsh-typert-protocol").TypertRemoteMethod<object, unknown, "stream", unknown, unknown>>>>;
export default TYPERT_REMOTE;
