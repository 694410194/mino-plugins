import Schema from '@deepseek-ai/schemastery';
const daily = (fallback) => Schema.transform(Schema.number(), value => {
    if (!Number.isSafeInteger(value) || value < 0 || value > 100000)
        throw Error('Invalid shadow daily limit');
    return value;
}).default(fallback);
export const shadowConfigFields = {
    shadowEnabled: Schema.boolean().default(false),
    offlineOrganizeEnabled: Schema.boolean().default(false),
    shadowDomainDaily: daily(20), shadowBotDaily: daily(5),
};
//# sourceMappingURL=config.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
