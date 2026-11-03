import { activityRecordSchema } from '../../shared/activity.js';
import { createActivityPreview } from '../../shared/activity-preview.js';
/** A bounded Host-only projection: public registry materialization restores its
 * state, and complete future events advance it without direct history reads.
 * null means no human message; an empty string remembers image-only input.
 */
export const firstUserProjection = {
    key: 'dshBotFirstUserPreview',
    stateVersion: 1,
    stateSchema: activityRecordSchema.shape.firstUserPreview.unwrap().nullable(),
    init: () => null,
    apply: (state, event) => {
        if (state !== null ||
            event.type !== 'user/message' ||
            event.data.source.kind !== 'user' ||
            event.surfaceOp !== 'append')
            return state;
        return createActivityPreview(event.data.content
            .filter((block) => block.type === 'text')
            .map((block) => block.text)
            .join('\n'));
    },
};
//# sourceMappingURL=first-user.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
