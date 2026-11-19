/**
 * Build the plugin generate-route request that reproduces a conversation
 * image with an edited prompt. The output label `size(, quality=...)` the
 * host recorded is parsed back into request fields so the revision repeats
 * the same knobs.
 */
export function conversationRegenerateRequest(image, prompt, remembered) {
    const settings = remembered ?? outputSettings(image.output);
    const request = { prompt: prompt.trim(), model: image.model };
    const size = sizeFromRatio(settings.ratio);
    if (size !== undefined)
        request.size = size;
    if (settings.quality !== 'default' && settings.quality !== '')
        request.quality = settings.quality;
    return request;
}
function outputSettings(output) {
    const normalized = (output ?? '').trim();
    const [size, qualityPart] = normalized.split(',').map(value => value.trim());
    return {
        ratio: ratioFromSize(size ?? ''),
        quality: qualityPart?.startsWith('quality=') ? qualityPart.slice(8) : 'default',
    };
}
function ratioFromSize(size) {
    const dimensions = size.split('x').map(Number);
    if (dimensions.length === 2 && dimensions.every(value => Number.isFinite(value) && value > 0)) {
        const target = dimensions[0] / dimensions[1];
        for (const ratio of ['1:1', '3:2', '2:3', '4:3', '3:4', '16:9', '9:16']) {
            const [width, height] = ratio.split(':').map(Number);
            if (Math.abs(target - width / height) < 0.015)
                return ratio;
        }
    }
    const sizes = { '1024x1024': '1:1', '1536x1024': '3:2', '1024x1536': '2:3' };
    return sizes[size] ?? '1:1';
}
function sizeFromRatio(ratio) {
    const sizes = { '1:1': '1024x1024', '3:2': '1536x1024', '2:3': '1024x1536' };
    return sizes[ratio];
}
//# sourceMappingURL=conversation-regenerate.js.map