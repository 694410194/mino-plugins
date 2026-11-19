export type VNoteStatus = 'recording' | 'transcribing' | 'ready' | 'failed';
export interface VNoteSegment {
    seq: number;
    file: string;
    bytes: number;
    durationMs?: number;
}
export interface VNote {
    id: string;
    title: string;
    status: VNoteStatus;
    createdAt: string;
    updatedAt: string;
    stoppedAt?: string;
    segments: VNoteSegment[];
    transcript?: string;
    summary?: string;
    shareId?: string;
    error?: string;
    audioSeconds?: number;
}
export declare function loadNotes(): Record<string, VNote>;
export declare function saveNotes(notes: Record<string, VNote>): void;
export declare function getNote(id: string): VNote | undefined;
export declare function putNote(note: VNote): void;
export declare function deleteNote(id: string): boolean;
export declare function segmentPath(id: string, seq: number): string;
export declare function appendSegment(id: string, seq: number, wav: Buffer, durationMs?: number): VNoteSegment;
export declare function readSegment(id: string, seq: number): Buffer | undefined;
export declare function newId(): string;
