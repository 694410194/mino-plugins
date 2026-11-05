import { type ReactNode } from 'react';
interface Notice {
    title: string;
    content: ReactNode;
    success?: boolean;
}
export declare const useManagementNotice: () => ((notice: Notice | undefined) => void) | undefined;
/** One scoped slot replaces repeated checks; leaving the skill disposes its timer and notice. */
export declare function ManagementNoticeBoundary({ children, container }: {
    children: ReactNode;
    container: HTMLElement | null;
}): import("react/jsx-runtime").JSX.Element;
export {};
