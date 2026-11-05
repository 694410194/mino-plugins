/**
 * Web routes for the panel under the host webserver (when one is composed):
 *   GET  /api/dsh-proactive/state    one full snapshot
 *   POST /api/dsh-proactive/action   one closed action, returns the fresh snapshot
 *   GET  /api/dsh-proactive/events   SSE change stream (client re-pulls state)
 *
 * Missing webserver (headless profiles) degrades to a no-op with one log line;
 * the plugin keep working without a GUI.
 */
const ACTION_BODY_MAX_BYTES = 64 * 1024;
const HEARTBEAT_MS = 15_000;
function writeJson(res, status, body) {
    res.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
    res.end(JSON.stringify(body));
}
/** Parse the optional `session` query parameter; empty string → undefined. Malformed encoding fails closed (undefined). */
function sessionParam(req) {
    const raw = (req.url ?? "").split("?")[1];
    if (raw === undefined)
        return undefined;
    for (const part of raw.split("&")) {
        if (part.startsWith("session=")) {
            let value;
            try {
                value = decodeURIComponent(part.slice("session=".length));
            }
            catch {
                // Bad percent-encoding: treat as absent rather than crashing the request.
                return undefined;
            }
            value = value.trim();
            return value === "" ? undefined : value;
        }
    }
    return undefined;
}
async function readBoundedJson(req, maxBytes) {
    const chunks = [];
    let size = 0;
    for await (const chunk of req) {
        const buffer = chunk;
        size += buffer.length;
        if (size > maxBytes)
            throw new Error("body too large");
        chunks.push(buffer);
    }
    const text = Buffer.concat(chunks).toString("utf8");
    if (text.trim() === "")
        throw new Error("empty body");
    return JSON.parse(text);
}
/**
 * Install the panel routes on ctx.webserver when available. Returns the
 * combined disposer (all disposers in sequence) or undefined when no
 * webserver is composed.
 */
export function installPanelRoutes(ctx, service, subscribe) {
    const webserver = ctx.get("webServer", false);
    if (webserver === undefined || webserver === null) {
        ctx.logger.info("dsh-proactive: no webserver composed; panel routes not installed.");
        return undefined;
    }
    const disposers = [];
    disposers.push(webserver.register({ kind: "exact", path: "/api/dsh-proactive/state", handler: (req, res) => {
            void service.snapshot(sessionParam(req)).then((snapshot) => writeJson(res, 200, snapshot), () => writeJson(res, 500, { code: "internal_error", message: "snapshot failed" }));
        } }));
    disposers.push(webserver.register({ kind: "exact", path: "/api/dsh-proactive/action", handler: (req, res) => {
            if (req.method !== "POST") {
                writeJson(res, 405, { code: "bad_action", message: "POST required" });
                return;
            }
            void readBoundedJson(req, ACTION_BODY_MAX_BYTES)
                .then((body) => service.action(body, sessionParam(req)))
                .then((result) => {
                if (result.ok)
                    writeJson(res, 200, result.snapshot);
                else
                    writeJson(res, 400, result.error);
            })
                .catch((error) => {
                const message = error instanceof Error ? error.message : String(error);
                writeJson(res, 400, { code: "bad_action", message });
            });
        } }));
    disposers.push(webserver.register({ kind: "exact", path: "/api/dsh-proactive/events", handler: (req, res) => {
            res.writeHead(200, {
                "content-type": "text/event-stream; charset=utf-8",
                "cache-control": "no-store",
                "connection": "keep-alive"
            });
            let closed = false;
            const send = (payload) => {
                if (closed || res.writableEnded)
                    return;
                res.write(payload);
            };
            const notify = () => {
                send("event: changed\ndata: {\"now\":\"" + new Date().toISOString() + "\"}\n\n");
            };
            const unsubscribe = subscribe(notify);
            const heartbeat = setInterval(() => {
                send(": keepalive\n\n");
            }, HEARTBEAT_MS);
            const cleanup = () => {
                closed = true;
                clearInterval(heartbeat);
                unsubscribe();
            };
            req.on("close", cleanup);
            res.on("close", cleanup);
            send(": connected\n\n");
        } }));
    return () => {
        for (const dispose of disposers)
            dispose();
    };
}
