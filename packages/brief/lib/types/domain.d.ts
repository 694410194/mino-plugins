import { z } from 'zod';
/** Small singleton row: `schedule:morning` → schedule id, `gone:morning` → '1'. */
export declare const StateRow: z.ZodObject<{
    key: z.ZodString;
    value: z.ZodString;
}, z.core.$strip>;
export type StateRow = z.infer<typeof StateRow>;
export declare const briefDomain: {
    name: string;
    version: number;
    tables: {
        state: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, {
            key: string;
            value: string;
        }>;
    };
};
