import { z } from 'zod';
import { assertTrustedIngress } from './trusted-ingress.js';
import { rejectMemorySecrets } from './secrets.js';
export const sourceSelectionSchema = z.strictObject({
    start: z.number().int().nonnegative(), end: z.number().int().positive(),
    content: z.string().min(1).max(2048), kind: z.enum(['user_fact', 'user_event']),
});
/** Pure extraction contract, NOT a trusted entry adapter. Offsets are Unicode code points, end-exclusive. */
export function extractSource(message, raw) {
    const selected = sourceSelectionSchema.parse(raw), points = [...message.text];
    if (!Number.isSafeInteger(message.at) || message.at < 0 || !Number.isInteger(message.attachments) || message.attachments < 0)
        throw new Error('Invalid accepted message');
    if (selected.end > points.length || selected.start >= selected.end ||
        points.slice(selected.start, selected.end).join('') !== selected.content)
        throw new Error('Source span/content mismatch');
    rejectMemorySecrets({ content: selected.content });
    const candidate = { status: 'candidate', reason: 'ambiguous-source' };
    // Deliberately narrow grammar: no pasted material, quotations, links, markup, code, roles or surrounding instructions.
    if (points.some(p => (p.codePointAt(0) ?? 0) < 32) || message.attachments || selected.start !== 0 || selected.end !== points.length ||
        /[\n\r<>`"“”‘’「」『』{}[\]]|https?:|(?:quote|forward|paste|pretend|role.?play|hypothetical|summari[sz]e|if I)\b/iu.test(message.text) ||
        /引用|转发|粘贴|代码|附件|假设|扮演|总结|材料|如果|据说/u.test(message.text))
        return candidate;
    const patterns = selected.kind === 'user_fact' ? [
        /^(?:I live in|I prefer) ([\p{L}\p{N} ,'-]{1,80})[.!]?$/u,
        /^(?:我住在|我喜欢)([\p{L}\p{N}，、 ]{1,80})[。！]?$/u,
    ] : [/^I moved to ([\p{L}\p{N} ,'-]{1,80})[.!]?$/u, /^我搬到了([\p{L}\p{N}，、 ]{1,80})[。！]?$/u];
    if (!patterns.some(pattern => pattern.test(selected.content)))
        return candidate;
    return { status: 'extractable', payload: { content: selected.content, subject: 'user',
            factKey: /live|住在/u.test(selected.content) ? 'residence' : /prefer|喜欢/u.test(selected.content) ? 'preference' : 'move',
            qualifiers: {}, valid: { from: message.at, to: null, basis: 'message-default' }, sourceExcerpt: selected.content } };
}
/** Production path always fails closed until upstream supplies an unforgeable accepted-entry proof. */
export function prepareAutomaticShare(claimedReceipt, _selection) {
    return assertTrustedIngress(claimedReceipt);
}
//# sourceMappingURL=auto-share.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
