import { z } from 'zod';
export declare const usageSchema: z.ZodObject<{
    calls: z.ZodNumber;
    input: z.ZodNumber;
    output: z.ZodNumber;
    money: z.ZodNumber;
}, z.core.$strict>;
export type Usage = z.output<typeof usageSchema>;
export declare const priceSchema: z.ZodObject<{
    version: z.ZodString;
    model: z.ZodString;
    source: z.ZodLiteral<"synthetic">;
    call: z.ZodNumber;
    input: z.ZodNumber;
    output: z.ZodNumber;
}, z.core.$strict>;
export type Price = z.output<typeof priceSchema>;
export declare const reservationInputSchema: z.ZodObject<{
    id: z.ZodString;
    runId: z.ZodString;
    caseId: z.ZodString;
    attempt: z.ZodNumber;
    model: z.ZodString;
    priceVersion: z.ZodString;
    calls: z.ZodNumber;
    inputCeiling: z.ZodNumber;
    outputCeiling: z.ZodNumber;
    moneyCeiling: z.ZodNumber;
}, z.core.$strict>;
export type ReservationInput = z.output<typeof reservationInputSchema>;
export declare const reservationSchema: z.ZodObject<{
    id: z.ZodString;
    runId: z.ZodString;
    caseId: z.ZodString;
    attempt: z.ZodNumber;
    model: z.ZodString;
    priceVersion: z.ZodString;
    calls: z.ZodNumber;
    inputCeiling: z.ZodNumber;
    outputCeiling: z.ZodNumber;
    moneyCeiling: z.ZodNumber;
    state: z.ZodEnum<{
        unknown: "unknown";
        reserved: "reserved";
        settled: "settled";
    }>;
    actual: z.ZodOptional<z.ZodObject<{
        calls: z.ZodNumber;
        input: z.ZodNumber;
        output: z.ZodNumber;
        money: z.ZodNumber;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare const ledgerSchema: z.ZodObject<{
    version: z.ZodLiteral<1>;
    limits: z.ZodObject<{
        calls: z.ZodNumber;
        input: z.ZodNumber;
        output: z.ZodNumber;
        money: z.ZodNumber;
    }, z.core.$strict>;
    price: z.ZodObject<{
        version: z.ZodString;
        model: z.ZodString;
        source: z.ZodLiteral<"synthetic">;
        call: z.ZodNumber;
        input: z.ZodNumber;
        output: z.ZodNumber;
    }, z.core.$strict>;
    reservations: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        runId: z.ZodString;
        caseId: z.ZodString;
        attempt: z.ZodNumber;
        model: z.ZodString;
        priceVersion: z.ZodString;
        calls: z.ZodNumber;
        inputCeiling: z.ZodNumber;
        outputCeiling: z.ZodNumber;
        moneyCeiling: z.ZodNumber;
        state: z.ZodEnum<{
            unknown: "unknown";
            reserved: "reserved";
            settled: "settled";
        }>;
        actual: z.ZodOptional<z.ZodObject<{
            calls: z.ZodNumber;
            input: z.ZodNumber;
            output: z.ZodNumber;
            money: z.ZodNumber;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
    blocked: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strict>;
export type LedgerState = z.output<typeof ledgerSchema>;
export declare const zeroUsage: () => Usage;
export declare function addUsage(a: Usage, b: Usage): Usage;
export declare const within: (a: Usage, b: Usage) => boolean;
export declare function charge(price: Price, calls: number, input: number, output: number): Usage;
export declare const ceiling: (row: ReservationInput) => Usage;
