import type { Agent } from '@deepseek-ai/dsh-agent';
import { type BotKey } from '../../shared/integrations.js';
import type { Notifications } from './service.js';
export declare function registerNotifyTool(agent: Agent, owner: BotKey, service: Notifications): () => void;
