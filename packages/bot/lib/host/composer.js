import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { entryListSchema } from '@deepseek-ai/cordis-plugin-include';
import { entryListProblem } from '@deepseek-ai/dsh-agent-preset-registry';
import { load } from 'js-yaml';
import { DshBotError } from './errors.js';
export function botSkillsDirectory(botId, config) {
    return join(config.dataDir, 'bots', botId, 'skills');
}
/** Host-owned files are independent of the storageDomain backend. Never remove
 * a directory on rollback/delete: it may contain user-authored skills. */
export async function ensureBotSkillsDirectory(botId, config) {
    const path = botSkillsDirectory(botId, config);
    try {
        await mkdir(path, { recursive: true });
    }
    catch (cause) {
        throw new DshBotError('bot/preset-failed', `Cannot prepare skills directory '${path}'`, { cause });
    }
}
function flattenRows(rows) {
    return rows.flatMap((row) => [row, ...(row.group === true ? flattenRows(row.config) : [])]);
}
function objectConfig(row) {
    if (row.config === undefined)
        return {};
    if (row.config === null || typeof row.config !== 'object' || Array.isArray(row.config)) {
        throw new Error(`Row '${row.id ?? row.name}' requires an object config`);
    }
    return row.config;
}
/** rc.2 readDocument uses the public Loader entry-list dialect. Expressions
 * remain { __jsExpr } nodes until the Host Loader evaluates them. */
export async function composeBotPreset(bot, ctx, config = ctx.dshBots?.config) {
    try {
        if (!config)
            throw new Error('Bot composer requires the Host registry config');
        const document = await ctx.agentPresets.readDocument(bot.template);
        if (document.agentPreset !== bot.template)
            throw new Error('Template identity does not match the requested preset');
        const value = load(document.content, { schema: entryListSchema });
        const problem = entryListProblem(value);
        if (problem)
            throw new Error(problem);
        const rows = structuredClone(value);
        const personas = rows.filter((row) => row.id === 'persona');
        if (personas.length !== 1)
            throw new Error('Template must contain exactly one persona row');
        const allRows = flattenRows(rows);
        // standard already ships this native plugin; minimal does not. Preserve
        // Host-provided rows/configuration and never duplicate nested providers.
        if (!allRows.some((row) => row.name === '@deepseek-ai/dsh-tool-schedule')) {
            if (allRows.some((row) => row.id === 'tool-schedule'))
                throw new Error('Template tool-schedule id collision');
            rows.push({ id: 'tool-schedule', name: '@deepseek-ai/dsh-tool-schedule' });
        }
        if (allRows.some((row) => row.id === 'bot-context' || row.name === 'dsh-bot/bot-context')) {
            throw new Error('Template already contains bot-context');
        }
        const skills = allRows.filter((row) => row.name === '@deepseek-ai/dsh-skill-filesystem');
        if (skills.length > 1 ||
            (skills[0] && !rows.includes(skills[0])) ||
            (bot.template === 'standard' && skills.length !== 1)) {
            throw new Error('Template must contain exactly one skill-filesystem row (minimal may omit it)');
        }
        const persona = personas[0];
        if (!persona)
            throw new Error('Missing persona');
        rows[rows.indexOf(persona)] = { ...persona, name: '@deepseek-ai/dsh-persona', config: { ...bot.persona } };
        const skillsRow = skills[0] ?? { id: 'skill-filesystem', name: '@deepseek-ai/dsh-skill-filesystem' };
        const configuredSkills = {
            ...skillsRow,
            config: {
                ...objectConfig(skillsRow),
                customSkillDirs: [botSkillsDirectory(bot.id, config), ...bot.skills.extraDirs],
            },
        };
        if (skills.length)
            rows[rows.indexOf(skillsRow)] = configuredSkills;
        else {
            if (rows.some((row) => row.id === skillsRow.id))
                throw new Error('Template skill-filesystem id collision');
            rows.push(configuredSkills);
        }
        // The generation captures tools/model from registry.presetBot() at activation;
        // its only public row parameter is the bound identity.
        rows.push({ id: 'bot-context', name: 'dsh-bot/bot-context', config: { botId: bot.id } });
        return {
            id: `${config.presetIdPrefix}${bot.id}`,
            name: bot.name,
            description: bot.description,
            order: bot.order ?? config.presetOrder,
            plugins: rows,
        };
    }
    catch (cause) {
        throw new DshBotError('bot/preset-failed', `Cannot compose Bot '${bot.id}' from '${bot.template}': ${cause instanceof Error ? cause.message : String(cause)}`, { cause });
    }
}
//# sourceMappingURL=composer.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
