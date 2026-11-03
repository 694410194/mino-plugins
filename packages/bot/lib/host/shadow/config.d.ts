import Schema from '@deepseek-ai/schemastery';
export interface ShadowConfig {
    shadowEnabled: boolean;
    offlineOrganizeEnabled: boolean;
    shadowDomainDaily: number;
    shadowBotDaily: number;
}
export declare const shadowConfigFields: {
    shadowEnabled: Schema<boolean, boolean, "defined">;
    offlineOrganizeEnabled: Schema<boolean, boolean, "defined">;
    shadowDomainDaily: Schema<number, number, "defined">;
    shadowBotDaily: Schema<number, number, "defined">;
};
