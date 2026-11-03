import { z } from 'zod';
export declare const onboardingSourceSchema: z.ZodObject<{
    kind: z.ZodLiteral<"dsh-bot-onboarding">;
    botId: z.ZodString;
    botCreatedAt: z.ZodNumber;
    operationId: z.ZodUUID;
    sessionId: z.ZodString;
    inputId: z.ZodString;
    context: z.ZodObject<{
        form: z.ZodLiteral<"notice">;
        summary: z.ZodString;
    }, z.core.$strict>;
}, z.core.$strict>;
export type OnboardingSource = z.output<typeof onboardingSourceSchema>;
declare module '@deepseek-ai/dsh-llm' {
    interface MessageSourceMap {
        'dsh-bot-onboarding': OnboardingSource;
    }
}
