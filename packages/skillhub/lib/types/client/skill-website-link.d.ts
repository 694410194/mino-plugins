/** Use only the API's complete public page URL; never append local configuration or credentials. */
export declare function safeSkillWebUrl(value: string | null | undefined): string | undefined;
export declare function SkillWebsiteLink({ webUrl, enabled }: {
    webUrl?: string | null;
    enabled: boolean;
}): import("react/jsx-runtime").JSX.Element | null;
