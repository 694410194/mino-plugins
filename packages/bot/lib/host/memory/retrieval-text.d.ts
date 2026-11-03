export declare const normalizeRetrieval: (text: string) => string;
/** Local vocabulary only: bounded, reviewable data; never learns from queries or stored memories. */
export declare function retrievalTerms(input: string): Map<string, number>;
