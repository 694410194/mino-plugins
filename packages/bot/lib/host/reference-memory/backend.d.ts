import type { Agent } from '@deepseek-ai/dsh-agent';
import { type BotKey } from '../../shared/integrations.js';
import { type GraphStatus } from '../../shared/reference-memory.js';
import { ReferenceWriter } from './writer.js';
export declare class ReferenceBackend extends ReferenceWriter {
    status(bot: BotKey): GraphStatus;
    apply(bot: BotKey): Promise<void>;
    protected main(bot: BotKey): Promise<Agent | undefined>;
    protected applyNow(bot: BotKey): Promise<void>;
    protected ready(bot: BotKey): Promise<import("./model.js").Live>;
    botChanged(id: string): void;
    close(): Promise<void>;
}
