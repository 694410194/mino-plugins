import { z } from "zod";
import { Context } from "@deepseek-ai/cordis";
declare const name = "mino-meeting-detect";
declare const inject: string[];
declare const Config: z.ZodPrefault<z.ZodObject<{
  workspaceRoot: z.ZodOptional<z.ZodString>;
  pollMinutes: z.ZodDefault<z.ZodNumber>;
  leadMinutes: z.ZodDefault<z.ZodNumber>;
  lookaheadDays: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>>;
type MeetingDetectConfig = z.infer<typeof Config>;
declare function apply(ctx: Context, config: MeetingDetectConfig): Promise<void>;
export { Config, MeetingDetectConfig, apply, inject, name };