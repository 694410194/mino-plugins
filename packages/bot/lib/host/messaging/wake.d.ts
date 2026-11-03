import type { PreStepDecision } from '@deepseek-ai/dsh-agent';
import type { UserMessage } from '@deepseek-ai/dsh-llm';
export declare const isWake: (message: UserMessage) => boolean;
/** Native next() adds ambient context. It is not business input that may wake a model. */
export declare function withoutWakeControls(claimed: UserMessage[], decision: PreStepDecision): PreStepDecision;
