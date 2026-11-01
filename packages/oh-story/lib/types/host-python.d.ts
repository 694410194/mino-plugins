export interface PythonProbe {
    readonly ok: boolean;
    readonly version?: string | undefined;
    readonly minimum: string;
}
/** A Python version floor as `[major, minor]`. */
export type PythonFloor = readonly [major: number, minor: number];
/** Every bundled Drama script declares `MINIMUM_PYTHON = (3, 9)`. */
export declare const DRAMA_PYTHON: PythonFloor;
/** video-recap-skills documents Python 3.10 or newer. */
export declare const VIDEO_PYTHON: PythonFloor;
export declare function commandOutput(command: string, args: readonly string[]): Promise<string | undefined>;
/** Each upstream Skill set has its own floor, so the caller names the one it runs. */
export declare function pythonVersion(value: string | undefined, floor: PythonFloor): PythonProbe;
/**
 * The interpreter the host will run upstream scripts with. The first command
 * that meets the version floor wins; an interpreter that answers but is too old
 * is reported only when nothing better exists, so `python3` at 3.9 does not hide
 * `python` at 3.12. The command is written into the adapter config's argv, so
 * this is the same choice everywhere the plugin starts Python.
 */
export declare function hostPython(floor: PythonFloor, probe?: (command: string, args: readonly string[]) => Promise<string | undefined>): Promise<{
    readonly command: string;
    readonly probe: PythonProbe;
}>;
//# sourceMappingURL=host-python.d.ts.map