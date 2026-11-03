import { canReadLabel } from './labels.js';
/** Browser provider registration only publishes a name in rc.2; it exposes no exact
 * Session-owned ToolDefinition catalog. Never infer browser authority from providerName,
 * mcp__ prefix, description or schema. Per-Bot browser MCP may instead use the existing
 * explicitly assigned managed connector boundary.
 */
/** Closed catalog verified against the rc.2 preset's public tools. No namespace/prefix admission.
 * Creation of children remains managed by bot_delegate, which records their audience before startup.
 * run_code remains closed: its transport and all nested dispatches need a separate audit.
 */
export const NATIVE_TOOL_NAMES = [
    'read', 'write', 'edit', 'read_image', 'glob', 'grep', 'bash', 'pwsh',
    'web_search', 'web_fetch', 'skill', 'present', 'job_output', 'job_list', 'job_kill',
    'schedule_create', 'schedule_list', 'schedule_update', 'schedule_delete',
    'list_agents', 'send_message', 'interrupt_agent', 'ask_user_question', 'todo_write',
    'get_goal', 'create_goal', 'update_goal', 'bot_manage',
];
/** Host registration is trusted, not third-party plugin isolation. rc.2 exposes exact definitions
 * via tools.get, but no public publisher identity. Pin all visible definitions once after preset
 * initialization (first pre-step, or first direct dispatch); reject subsequent shadow/replacements.
 */
export function nativePolicy(agent, bot, registry, flow) {
    let definitions;
    const enabled = () => registry.config?.nativeToolPolicy !== 'restricted';
    const capture = () => {
        if (definitions)
            return;
        definitions = new Map();
        for (const name of NATIVE_TOOL_NAMES) {
            const definition = agent.ctx.tools.get(name, agent);
            if (definition)
                definitions.set(name, definition);
        }
    };
    const owns = (name) => {
        if (!enabled())
            return false;
        capture();
        const definition = definitions?.get(name);
        return definition !== undefined && agent.ctx.tools.get(name, agent) === definition;
    };
    const assertAllowed = (exec) => {
        exec.signal.throwIfAborted();
        if (exec.agent !== agent || !owns(exec.name))
            throw new Error('Native tool identity changed or unavailable');
        flow.kernel.assertReadable();
        flow.kernel.assertOwnership();
        const label = flow.label(agent.session.id);
        if (label.restrictions.some(r => ['revoked', 'pending-cleanup', 'secret'].includes(r)))
            throw new Error('Restricted native execution source');
        return label;
    };
    return {
        capture, owns,
        candidate: (name) => NATIVE_TOOL_NAMES.includes(name),
        reason(exec) {
            try {
                assertAllowed(exec);
            }
            catch (error) {
                return error instanceof Error ? error.message : 'Native execution unavailable';
            }
        },
        async dispatch(exec, next) {
            const label = assertAllowed(exec);
            // Same trusted execution audience, candidate content. Never broaden an unknown or private
            // audience to shared; group children retain their explicit group audience for checked return.
            await flow.inherit(agent.session.id, { ...label, readers: label.readers === 'shared' ? [bot] : label.readers,
                originTrust: 'candidate' });
            if (exec.name === 'send_message') {
                const args = exec.arguments;
                if (typeof args?.agent_id !== 'string')
                    throw new Error('Missing native message target');
                const source = flow.label(agent.session.id), target = flow.label(args.agent_id);
                if (target.readers === 'shared' ? source.readers !== 'shared' :
                    !target.readers.length || !target.readers.every(reader => canReadLabel(source, reader)))
                    throw new Error('Native message audience exceeds current data scope');
                await flow.inherit(args.agent_id, source);
            }
            assertAllowed(exec); // asynchronous persistence must not permit policy/definition changes
            return next();
        },
    };
}
//# sourceMappingURL=native-policy.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
