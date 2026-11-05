/**
 * Wire contract between the GUI panel (client half) and the host-side panel
 * service. One dialect is shared with the model tools through the closed
 * validation in alarm-factory.ts, so a UI action and a proactive_set call
 * accept the same create shape and surface the same error codes.
 *
 * v2 (260907-proactive-alarm-v2): the form carries a three-way kind
 * (once/every/cron), the unified jitterSeconds, the respectQuietHours switch
 * and the target_mode/target_session_id destination — the same vocabulary as
 * proactive_set, mapped through createArgsFromForm.
 */
/** Map a form to the shared argument root so one validator serves both surfaces. */
export function createArgsFromForm(form) {
    const args = { prompt: form.prompt };
    if (form.kind === "file") {
        // Always sent (even empty) so an unfinished form yields the path error
        // rather than "exactly one selector is required".
        args["schedule_file"] = (form.scheduleFile ?? "").trim();
    }
    else if (form.kind === "every") {
        if (form.everySeconds !== undefined)
            args["every_seconds"] = form.everySeconds;
    }
    else if (form.kind === "cron") {
        if (form.cron !== undefined && form.cron !== "")
            args["cron"] = form.cron;
    }
    else {
        // once — either a relative delay or a local absolute instant.
        if (form.afterSeconds !== undefined) {
            args["after_seconds"] = form.afterSeconds;
        }
        else if (form.atDate !== undefined && form.atDate !== "" && form.atTime !== undefined && form.atTime !== "") {
            // Local absolute instant: the zone is resolved host-side through the
            // same default chain as top-level time_zone (client zone -> host zone),
            // so an empty slot here means "the caller's zone", never a hardcoded UTC.
            args["at"] = { date: form.atDate, time: form.atTime + ":00", time_zone: form.timeZone ?? "" };
        }
    }
    // Jitter is a first-class knob on all three types (v2: once/every/cron all
    // accept a per-occurrence random delay); stale zero values are simply dropped.
    if (form.jitterSeconds !== undefined && form.jitterSeconds > 0)
        args["jitter_seconds"] = form.jitterSeconds;
    if (form.minIdleSeconds !== undefined && form.minIdleSeconds > 0)
        args["min_idle_seconds"] = form.minIdleSeconds;
    if (form.timeZone !== undefined && form.timeZone !== "")
        args["time_zone"] = form.timeZone;
    if (form.respectQuietHours !== undefined)
        args["respect_quiet_hours"] = form.respectQuietHours;
    if (form.compaction !== undefined)
        args["compaction"] = form.compaction;
    const mode = form.targetMode ?? "resume";
    const source = mode === "resume" || mode === "fork"
        ? (form.targetSource ?? (form.targetWorkspaceId !== undefined && form.targetPresetId === undefined && form.targetSessionId === undefined ? "workspace" : "session"))
        : undefined;
    if (mode !== "resume")
        args["target_mode"] = mode;
    if (source !== undefined && source !== "session")
        args["target_source"] = source;
    // Stale fields left over from switching mode/source must not leak into a
    // combination the shared validator rejects; ids are sent trimmed so a
    // padded input never fails validation.
    if (mode === "resume" || mode === "fork" || mode === "workspace") {
        if (source === "session") {
            const targetSessionId = (form.targetSessionId ?? "").trim();
            if (targetSessionId !== "")
                args["target_session_id"] = targetSessionId;
        }
        if (source === "workspace" || mode === "workspace") {
            const workspaceId = (form.targetWorkspaceId ?? "").trim();
            if (workspaceId !== "")
                args["target_workspace_id"] = workspaceId;
        }
        if (source === "preset") {
            const presetId = (form.targetPresetId ?? "").trim();
            if (presetId !== "")
                args["target_preset_id"] = presetId;
        }
    }
    else if (mode === "new") {
        const workspaceId = (form.targetWorkspaceId ?? "").trim();
        if (workspaceId !== "")
            args["target_workspace_id"] = workspaceId;
        const presetId = (form.targetPresetId ?? "").trim();
        if (presetId !== "")
            args["target_preset_id"] = presetId;
        const provider = (form.targetProvider ?? "").trim();
        if (provider !== "")
            args["target_provider"] = provider;
        const model = (form.targetModel ?? "").trim();
        if (model !== "")
            args["target_model"] = model;
    }
    return args;
}
