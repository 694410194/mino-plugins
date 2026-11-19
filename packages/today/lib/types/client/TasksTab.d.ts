import type { Summary } from './api.ts';
import type { JobsSnapshotLite, SessionListLite, TodayActions, Translate } from './TodayPage.tsx';
type BoundHook<S> = <R>(selector: (state: S) => R, equal?: (a: R, b: R) => boolean) => R;
export declare function TasksTab({ t, actions, sessions, useJobs, now, summary, onChanged }: {
    t: Translate;
    actions: TodayActions;
    sessions: SessionListLite;
    useJobs?: BoundHook<JobsSnapshotLite>;
    now: number;
    summary: Summary | null;
    onChanged: () => void;
}): import("react").JSX.Element;
export {};
