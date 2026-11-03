/** Full text is screened before markdown removal/truncation, and again after
 * cleanup so formatting cannot split a credential signature across markup.
 * No original text or rejection details leave this function.
 */
export declare function createActivityPreview(text: string): string;
