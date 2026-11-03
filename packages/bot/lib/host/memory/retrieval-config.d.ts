import Schema from '@deepseek-ai/schemastery';
export interface Config {
    k1: number;
    bodyB: number;
    fieldB: number;
    factKeyWeight: number;
    qualifierWeight: number;
    subjectWeight: number;
    minCoverage: number;
    diversityPenalty: number;
    diversityThreshold: number;
    diversityWindow: number;
}
export declare const Config: Schema<Partial<Config>, Config>;
export declare const defaultRetrievalConfig: Readonly<Config>;
