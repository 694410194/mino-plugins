import type { LedgerState, ReservationInput, Usage } from '../../shared/eval-budget.js';
/** One owner/queue per ledger. Persistence must commit before admission; ambiguous writes freeze this instance. */
export declare class BudgetLedger {
    private state;
    private persist;
    private queue;
    private frozen;
    private constructor();
    static open(initial: LedgerState, persist: (state: LedgerState) => Promise<void>): Promise<BudgetLedger>;
    snapshot(): {
        version: 1;
        limits: {
            calls: number;
            input: number;
            output: number;
            money: number;
        };
        price: {
            version: string;
            model: string;
            source: "synthetic";
            call: number;
            input: number;
            output: number;
        };
        reservations: {
            id: string;
            runId: string;
            caseId: string;
            attempt: number;
            model: string;
            priceVersion: string;
            calls: number;
            inputCeiling: number;
            outputCeiling: number;
            moneyCeiling: number;
            state: "unknown" | "reserved" | "settled";
            actual?: {
                calls: number;
                input: number;
                output: number;
                money: number;
            } | undefined;
        }[];
        blocked?: boolean | undefined;
    };
    liability(): Usage;
    private commit;
    reserve(input: ReservationInput): Promise<{
        admitted: boolean;
        reservation: {
            id: string;
            runId: string;
            caseId: string;
            attempt: number;
            model: string;
            priceVersion: string;
            calls: number;
            inputCeiling: number;
            outputCeiling: number;
            moneyCeiling: number;
            state: "unknown" | "reserved" | "settled";
            actual?: {
                calls: number;
                input: number;
                output: number;
                money: number;
            } | undefined;
        };
    } | {
        admitted: boolean;
        reservation: {
            state: "reserved";
            id: string;
            runId: string;
            caseId: string;
            attempt: number;
            model: string;
            priceVersion: string;
            calls: number;
            inputCeiling: number;
            outputCeiling: number;
            moneyCeiling: number;
        };
    }>;
    settle(id: string, value: Usage | null): Promise<{
        id: string;
        runId: string;
        caseId: string;
        attempt: number;
        model: string;
        priceVersion: string;
        calls: number;
        inputCeiling: number;
        outputCeiling: number;
        moneyCeiling: number;
        state: "unknown" | "reserved" | "settled";
        actual?: {
            calls: number;
            input: number;
            output: number;
            money: number;
        } | undefined;
    }>;
    close(): Promise<void>;
}
