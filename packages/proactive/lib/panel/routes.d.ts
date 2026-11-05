/**
 * Web routes for the panel under the host webserver (when one is composed):
 *   GET  /api/dsh-proactive/state    one full snapshot
 *   POST /api/dsh-proactive/action   one closed action, returns the fresh snapshot
 *   GET  /api/dsh-proactive/events   SSE change stream (client re-pulls state)
 *
 * Missing webserver (headless profiles) degrades to a no-op with one log line;
 * the plugin keep working without a GUI.
 */
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Context } from "@deepseek-ai/cordis";
import type { ProactivePanelService } from "./service.js";
export interface WebServerLike {
    register(route: {
        kind: "exact" | "prefix";
        path: string;
        handler: (req: IncomingMessage, res: ServerResponse) => void | Promise<void>;
    }): () => void;
}
/**
 * Install the panel routes on ctx.webserver when available. Returns the
 * combined disposer (all disposers in sequence) or undefined when no
 * webserver is composed.
 */
export declare function installPanelRoutes(ctx: Context, service: ProactivePanelService, subscribe: (listener: () => void) => () => void): (() => void) | undefined;
