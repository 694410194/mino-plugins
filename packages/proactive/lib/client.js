window.__ModuleLoader__.load({
	id: "mino-proactive",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client/index.ts
var index_exports = {};
__export(index_exports, {
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(index_exports);

// src/client/panel.tsx
var import_react3 = require("react");

// src/client/host-api.ts
function isPanelError(body) {
  return typeof body.code === "string";
}
var STATE_URL = "/api/dsh-proactive/state";
var ACTION_URL = "/api/dsh-proactive/action";
var EVENTS_URL = "/api/dsh-proactive/events";
function sessionQuery(sessionId) {
  return sessionId === void 0 ? "" : "?session=" + encodeURIComponent(sessionId);
}
var ProactiveHostTransport = class {
  /** Fetch one snapshot; omit sessionId for the host-wide settings view. */
  async state(sessionId) {
    const response = await fetch(STATE_URL + sessionQuery(sessionId), { cache: "no-store" });
    const body = await response.json();
    if (!response.ok || isPanelError(body)) {
      throw new Error(body.code + ": " + (body.message ?? ""));
    }
    return body;
  }
  /**
   * Snapshot plus the complete session list, in one round trip: titles enrich
   * alarm rows and the id set feeds the create form's unknown-target hint.
   * Workspace rows are NOT here — they come from the client-side
   * `workspaces` service (see workspaces-source.ts). Both surfaces use this
   * (the session tab passes its own sessionId to keep the scoped snapshot).
   */
  async stateForHost(sessionId) {
    const [snapshot, sessions] = await Promise.all([this.state(sessionId), fetchSessionList()]);
    return {
      snapshot: withTitles(snapshot, toTitleMap(sessions)),
      sessions
    };
  }
  /** Run one closed action; the returned snapshot follows the same scope. */
  async action(action, sessionId) {
    const response = await fetch(ACTION_URL + sessionQuery(sessionId), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action })
    });
    const body = await response.json();
    if (!response.ok || isPanelError(body)) {
      throw new Error(body.code + ": " + (body.message ?? ""));
    }
    return body;
  }
  /** Like `stateForHost` for closed actions: refreshed snapshot + session list. */
  async actionForHost(action, sessionId) {
    const [snapshot, sessions] = await Promise.all([this.action(action, sessionId), fetchSessionList()]);
    return {
      snapshot: withTitles(snapshot, toTitleMap(sessions)),
      sessions
    };
  }
  /**
   * Subscribe to host change pushes; the listener re-pulls state on each event
   * and also whenever the stream (re)connects — a missed "changed" event during
   * a disconnection (sleep, network drop) must not leave the panel stale.
   */
  subscribe(listener) {
    const source = new EventSource(EVENTS_URL);
    source.addEventListener("changed", () => listener());
    source.onmessage = () => listener();
    source.onopen = () => listener();
    source.onerror = () => {
    };
    return () => source.close();
  }
};
function withTitles(snapshot, titles) {
  if (titles.size === 0) return snapshot;
  return {
    ...snapshot,
    alarms: snapshot.alarms.map((alarm) => {
      if (alarm.sessionTitle !== void 0 && alarm.sessionTitle !== "") return alarm;
      const title = titles.get(alarm.sessionId);
      const targetTitle = alarm.targetSessionId !== void 0 ? titles.get(alarm.targetSessionId) : void 0;
      return {
        ...alarm,
        sessionTitle: title ?? "",
        ...targetTitle !== void 0 && targetTitle !== "" ? { targetSessionTitle: targetTitle } : {}
      };
    })
  };
}
var SESSION_LIST_URL = "/api/session/list";
async function fetchSessionList() {
  try {
    const response = await fetch(SESSION_LIST_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        type: "client-request",
        rpcId: "dsh-proactive:session-list",
        method: "session/list",
        payload: { args: { _request: {} } }
      })
    });
    if (!response.ok) return [];
    const body = await response.json();
    if (body?.result?.ok !== true) return [];
    const sessions = [];
    for (const entry of body.result.value.items ?? []) {
      const title = entry.projections?.values?.title;
      sessions.push({
        id: entry.sessionId,
        title: typeof title === "string" && title !== "" ? title : "",
        ...typeof entry.cwd === "string" && entry.cwd !== "" ? { cwd: entry.cwd } : {}
      });
    }
    return sessions;
  } catch {
    return [];
  }
}
function toTitleMap(sessions) {
  const titles = /* @__PURE__ */ new Map();
  for (const session of sessions) {
    if (session.title !== "") titles.set(session.id, session.title);
  }
  return titles;
}

// src/client/workspaces-source.ts
var EMPTY_WORKSPACES = { items: [] };
var EMPTY_SOURCE = {
  subscribe: () => () => void 0,
  getSnapshot: () => EMPTY_WORKSPACES
};
function bindSource(source) {
  return {
    subscribe: (listener) => source.subscribe(listener),
    getSnapshot: () => {
      try {
        return source.getSnapshot();
      } catch {
        return EMPTY_WORKSPACES;
      }
    }
  };
}

// src/panel/contract.ts
function createArgsFromForm(form) {
  const args = { prompt: form.prompt };
  if (form.kind === "file") {
    args["schedule_file"] = (form.scheduleFile ?? "").trim();
  } else if (form.kind === "every") {
    if (form.everySeconds !== void 0) args["every_seconds"] = form.everySeconds;
  } else if (form.kind === "cron") {
    if (form.cron !== void 0 && form.cron !== "") args["cron"] = form.cron;
  } else {
    if (form.afterSeconds !== void 0) {
      args["after_seconds"] = form.afterSeconds;
    } else if (form.atDate !== void 0 && form.atDate !== "" && form.atTime !== void 0 && form.atTime !== "") {
      args["at"] = { date: form.atDate, time: form.atTime + ":00", time_zone: form.timeZone ?? "" };
    }
  }
  if (form.jitterSeconds !== void 0 && form.jitterSeconds > 0) args["jitter_seconds"] = form.jitterSeconds;
  if (form.minIdleSeconds !== void 0 && form.minIdleSeconds > 0) args["min_idle_seconds"] = form.minIdleSeconds;
  if (form.timeZone !== void 0 && form.timeZone !== "") args["time_zone"] = form.timeZone;
  if (form.respectQuietHours !== void 0) args["respect_quiet_hours"] = form.respectQuietHours;
  if (form.compaction !== void 0) args["compaction"] = form.compaction;
  const mode = form.targetMode ?? "resume";
  const source = mode === "resume" || mode === "fork" ? form.targetSource ?? (form.targetWorkspaceId !== void 0 && form.targetPresetId === void 0 && form.targetSessionId === void 0 ? "workspace" : "session") : void 0;
  if (mode !== "resume") args["target_mode"] = mode;
  if (source !== void 0 && source !== "session") args["target_source"] = source;
  if (mode === "resume" || mode === "fork" || mode === "workspace") {
    if (source === "session") {
      const targetSessionId = (form.targetSessionId ?? "").trim();
      if (targetSessionId !== "") args["target_session_id"] = targetSessionId;
    }
    if (source === "workspace" || mode === "workspace") {
      const workspaceId = (form.targetWorkspaceId ?? "").trim();
      if (workspaceId !== "") args["target_workspace_id"] = workspaceId;
    }
    if (source === "preset") {
      const presetId = (form.targetPresetId ?? "").trim();
      if (presetId !== "") args["target_preset_id"] = presetId;
    }
  } else if (mode === "new") {
    const workspaceId = (form.targetWorkspaceId ?? "").trim();
    if (workspaceId !== "") args["target_workspace_id"] = workspaceId;
    const presetId = (form.targetPresetId ?? "").trim();
    if (presetId !== "") args["target_preset_id"] = presetId;
    const provider = (form.targetProvider ?? "").trim();
    if (provider !== "") args["target_provider"] = provider;
    const model = (form.targetModel ?? "").trim();
    if (model !== "") args["target_model"] = model;
  }
  return args;
}

// src/domain.ts
var MAX_PROMPT_LENGTH = 4e3;
var DEFAULT_WAKE_PROMPT = "\u8FD9\u662F\u4E00\u4E2A heartbeat reminder\uFF0C\u4F60\u53EF\u4EE5\u9009\u62E9\u4E0E\u7528\u6237\u53D1\u9001\u6D88\u606F\u3002\u8BB0\u5F97\u5B8C\u5168\u8FDB\u5165\u4F60\u7684\u4EBA\u8BBE\u548C\u60C5\u5883\u3002\u5982\u679C\u4E0D\u5E0C\u671B\u53D1\u9001\u6D88\u606F\uFF0C\u5C31\u8C03\u7528 proactive_reclaim \u5B89\u9759\u7ED3\u675F\u3002";
var SESSION_ID_PATTERN = /^[A-Za-z0-9._-]+$/;
function isValidSessionId(sessionId) {
  if (sessionId === "" || sessionId.length > 200) return false;
  if (sessionId === "." || sessionId === "..") return false;
  return SESSION_ID_PATTERN.test(sessionId);
}
var MIN_FOUR_DIGIT_YEAR_MS = Date.parse("0001-01-01T00:00:00.000Z");
var MAX_FOUR_DIGIT_YEAR_MS = Date.parse("9999-12-31T23:59:59.999Z");

// src/client/sections.tsx
var import_react = require("react");
var import_jsx_runtime = require("react/jsx-runtime");
function stateLabel(copy, state) {
  switch (state) {
    case "scheduled":
      return copy.stateScheduled;
    case "overdue":
      return copy.stateOverdue;
    case "in-flight":
      return copy.stateInFlight;
    case "completed":
      return copy.stateCompleted;
    case "cancelled":
      return copy.stateCancelled;
    case "failed":
      return copy.stateFailed;
    case "paused":
      return copy.statePaused;
    default:
      return state;
  }
}
function isScheduleFilePath(value) {
  const path = (value ?? "").trim();
  return path.startsWith("/") && !/[*?]/.test(path);
}
function typeLabel(copy, type) {
  switch (type) {
    case "once":
      return copy.typeOnce;
    case "every":
      return copy.typeEvery;
    case "cron":
      return copy.typeCron;
    case "file":
      return copy.typeFile;
    default:
      return type;
  }
}
function targetLabel(copy, mode) {
  switch (mode) {
    case "resume":
      return copy.targetResume;
    case "fork":
      return copy.targetFork;
    case "new":
      return copy.targetNew;
    case "workspace":
      return copy.targetWorkspace;
    default:
      return mode;
  }
}
function sourceLabel(copy, source) {
  switch (source) {
    case "workspace":
      return copy.sourceWorkspace;
    case "preset":
      return copy.sourcePreset;
    case "session":
      return copy.sourceSession;
    default:
      return copy.sourceSession;
  }
}
function targetDetail(alarm) {
  if (alarm.targetMode === "workspace" || alarm.targetMode !== "new" && alarm.targetSource === "workspace") {
    return alarm.targetWorkspaceId !== void 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dshp-cell-dim", style: { marginTop: 2 }, title: alarm.targetWorkspaceId, children: alarm.targetWorkspaceTitle ?? alarm.targetWorkspaceId }) : null;
  }
  if (alarm.targetMode !== "new" && alarm.targetSource === "preset") {
    return alarm.targetPresetId !== void 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dshp-cell-dim", style: { marginTop: 2 }, title: alarm.targetPresetId, children: alarm.targetPresetId }) : null;
  }
  if (alarm.targetMode === "new") {
    const parts = [];
    if (alarm.targetWorkspaceId !== void 0 && alarm.targetWorkspaceId !== "") {
      parts.push(alarm.targetWorkspaceTitle ?? alarm.targetWorkspaceId);
    }
    if (alarm.targetPresetId !== void 0 && alarm.targetPresetId !== "") {
      parts.push(alarm.targetPresetId);
    }
    if (alarm.targetProvider !== void 0 && alarm.targetModel !== void 0) {
      parts.push(alarm.targetProvider + "/" + alarm.targetModel);
    }
    return parts.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dshp-cell-dim", style: { marginTop: 2 }, children: parts.join(" \xB7 ") }) : null;
  }
  return alarm.targetSessionId !== void 0 && alarm.targetSessionId !== "" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dshp-cell-dim", style: { marginTop: 2 }, children: alarm.targetSessionTitle ?? alarm.targetSessionId }) : null;
}
function decisionLabel(copy, decision) {
  switch (decision) {
    case "no_reply":
      return copy.decisionNoReply;
    case "reply":
      return copy.decisionReply;
    case "skipped":
      return copy.decisionSkipped;
    case "failed":
      return copy.decisionFailed;
    default:
      return decision;
  }
}
function fmtInstant(iso, localeTag) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString(localeTag, { hour12: false });
}
var HOST_PANEL_SESSION = "host-panel";
function fmtSession(sessionId, sessionTitle, copy) {
  if (sessionTitle !== void 0 && sessionTitle !== "") return sessionTitle;
  return sessionId === HOST_PANEL_SESSION ? copy.hostPanelLabel : sessionId;
}
function defaultPromptOf(snapshot) {
  const value = snapshot?.config.defaultPrompt;
  return typeof value === "string" && value.trim() !== "" ? value : DEFAULT_WAKE_PROMPT;
}
var ACTIVE_STATES = /* @__PURE__ */ new Set(["scheduled", "overdue", "in-flight", "paused"]);
function stateMatches(filter, state) {
  if (filter === "") return true;
  if (filter === "active") return ACTIVE_STATES.has(state);
  return state === filter;
}
function AlarmTable({ alarms, runsByAlarm, showSession, busy, copy, onToggle, onCancel, onFire, onEdit, onCopyId }) {
  const [stateFilter, setStateFilter] = (0, import_react.useState)("active");
  const [typeFilter, setTypeFilter] = (0, import_react.useState)("");
  const [sessionFilter, setSessionFilter] = (0, import_react.useState)("");
  const [sortKey, setSortKey] = (0, import_react.useState)("nextDue");
  const [expandedAlarm, setExpandedAlarm] = (0, import_react.useState)(null);
  const stateOptions = (0, import_react.useMemo)(() => {
    const set = new Set(alarms.map((alarm) => alarm.state));
    return [...set].sort();
  }, [alarms]);
  const sessionOptions = (0, import_react.useMemo)(() => {
    const seen = /* @__PURE__ */ new Set();
    return alarms.filter((alarm) => seen.has(alarm.sessionId) ? false : (seen.add(alarm.sessionId), true));
  }, [alarms]);
  const visible = (0, import_react.useMemo)(() => {
    const filtered = alarms.filter(
      (alarm) => stateMatches(stateFilter, alarm.state) && (typeFilter === "" || alarm.type === typeFilter) && (sessionFilter === "" || alarm.sessionId === sessionFilter)
    );
    const sorted = [...filtered].sort((a, b) => {
      if (sortKey === "created") return a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0;
      if (sortKey === "prompt") return a.prompt.localeCompare(b.prompt);
      return a.nextDueAt < b.nextDueAt ? 1 : a.nextDueAt > b.nextDueAt ? -1 : 0;
    });
    return sorted;
  }, [alarms, stateFilter, typeFilter, sessionFilter, sortKey]);
  const colSpan = showSession === true ? 8 : 7;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dshp-table-wrap", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dshp-toolbar", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", { className: "dshp-input", value: stateFilter, onChange: (e) => setStateFilter(e.target.value), children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "active", children: copy.filterActive }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "", children: copy.filterAllStates }),
        stateOptions.map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value, children: stateLabel(copy, value) }, value))
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", { className: "dshp-input", value: typeFilter, onChange: (e) => setTypeFilter(e.target.value), children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "", children: copy.filterAllTypes }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "once", children: copy.typeOnce }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "every", children: copy.typeEvery }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "cron", children: copy.typeCron }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "file", children: copy.typeFile })
      ] }),
      showSession === true ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", { className: "dshp-input", value: sessionFilter, onChange: (e) => setSessionFilter(e.target.value), children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "", children: copy.filterAllSessions }),
        sessionOptions.map((alarm) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: alarm.sessionId, children: fmtSession(alarm.sessionId, alarm.sessionTitle, copy) }, alarm.sessionId))
      ] }) : null,
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", { className: "dshp-input", value: sortKey, onChange: (e) => setSortKey(e.target.value), children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", { value: "nextDue", children: [
          copy.sortBy,
          ": ",
          copy.sortNextDue
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", { value: "created", children: [
          copy.sortBy,
          ": ",
          copy.sortCreated
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", { value: "prompt", children: [
          copy.sortBy,
          ": ",
          copy.sortPrompt
        ] })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", { className: "dshp-table", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: copy.prompt }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: copy.state }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: copy.type }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: copy.target }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: copy.nextDue }),
        showSession === true ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: copy.session }) : null,
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: copy.history }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: " " })
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [
        visible.map((alarm) => {
          const runs = runsByAlarm.get(alarm.id) ?? [];
          const expanded = expandedAlarm === alarm.id;
          return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dshp-cell-main", title: alarm.prompt, children: alarm.prompt }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dshp-cell-dim", children: [
                  stateLabel(copy, alarm.state),
                  alarm.respectQuietHours ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dshp-pill dshp-pill-plain", style: { marginLeft: 6 }, children: copy.quietLabel }) : null
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatePill, { copy, state: alarm.state }) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dshp-pill dshp-pill-plain", children: typeLabel(copy, alarm.type) }),
                alarm.type === "file" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dshp-cell-dim", style: { marginTop: 2 }, title: alarm.scheduleFile, children: [
                  alarm.scheduleFile,
                  " \xB7 ",
                  alarm.declaredEntries ?? 0,
                  " ",
                  copy.declaredEntries
                ] }) : null,
                alarm.jitterSeconds !== void 0 && alarm.jitterSeconds > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dshp-pill dshp-pill-accent", style: { marginLeft: 4 }, title: copy.jitterSeconds, children: [
                  "\xB1",
                  alarm.jitterSeconds,
                  "s"
                ] }) : null
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dshp-pill dshp-pill-plain", children: targetLabel(copy, alarm.targetMode) }),
                targetDetail(alarm)
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { className: "dshp-cell-mono", children: fmtInstant(alarm.nextDueAt, copy.dateTimeLocale) }),
              showSession === true ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dshp-session-cell", children: fmtSession(alarm.sessionId, alarm.sessionTitle, copy) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  "button",
                  {
                    className: "dshp-copy-btn",
                    title: copy.copyId,
                    "aria-label": copy.copyId,
                    onClick: (e) => {
                      e.stopPropagation();
                      onCopyId(alarm.sessionId);
                    },
                    children: "\u29C9"
                  }
                )
              ] }) : null,
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { className: "dshp-btn dshp-btn-sm", disabled: busy, onClick: () => setExpandedAlarm(expanded ? null : alarm.id), children: [
                expanded ? copy.hideHistory : copy.history,
                " (",
                runs.length,
                ")"
              ] }) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dshp-btn-row", children: [
                alarm.state === "scheduled" || alarm.state === "overdue" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "dshp-btn dshp-btn-sm", disabled: busy, onClick: () => onToggle(alarm.id), children: copy.pause }) : null,
                alarm.state === "paused" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "dshp-btn dshp-btn-sm", disabled: busy, onClick: () => onToggle(alarm.id), children: copy.resume }) : null,
                alarm.state === "scheduled" || alarm.state === "overdue" || alarm.state === "paused" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "dshp-btn dshp-btn-sm", disabled: busy, onClick: () => onEdit(alarm.id), children: copy.edit }) : null,
                alarm.state === "scheduled" || alarm.state === "overdue" || alarm.state === "paused" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "dshp-btn dshp-btn-sm dshp-btn-danger", disabled: busy, onClick: () => onCancel(alarm.id), children: copy.cancel }) : null,
                alarm.type !== "file" && (alarm.state === "scheduled" || alarm.state === "overdue" || alarm.state === "paused") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "dshp-btn dshp-btn-sm", disabled: busy, onClick: () => onFire(alarm.id), children: copy.fire }) : null
              ] }) })
            ] }),
            expanded ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { className: "dshp-history-row", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { colSpan, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RunsTable, { runs, copy }) }) }) : null
          ] }, alarm.id);
        }),
        visible.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { colSpan, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dshp-empty", children: copy.emptyAlarms }) }) }) : null
      ] })
    ] })
  ] });
}
function StatePill({ copy, state }) {
  const tone = state === "scheduled" ? "accent" : state === "overdue" ? "warn" : state === "in-flight" ? "warn" : state === "completed" ? "success" : state === "cancelled" || state === "failed" ? "error" : "plain";
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dshp-pill dshp-pill-" + tone, children: stateLabel(copy, state) });
}
function RunsTable({ runs, copy }) {
  if (runs.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dshp-empty", children: copy.emptyRuns });
  const rows = runs.slice(-8).reverse();
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", { className: "dshp-table dshp-table-sub", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: copy.runTime }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: copy.runDecision }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: copy.runBudget }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: copy.runSummary })
    ] }) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((run) => {
      const summaryParts = [
        ...run.reasoningSummary !== void 0 && run.reasoningSummary !== "" ? [copy.thinkingPrefix + run.reasoningSummary] : [],
        ...run.replySummary !== void 0 && run.replySummary !== "" ? [copy.replyPrefix + run.replySummary] : []
      ];
      const summaryText = summaryParts.join(" \xB7 ");
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { className: "dshp-cell-mono", children: fmtInstant(run.firedAt, copy.dateTimeLocale) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dshp-pill dshp-pill-plain", title: run.decision, children: decisionLabel(copy, run.decision) }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { className: "dshp-cell-mono", children: run.budgetDelta }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dshp-cell-main", style: { maxWidth: 420 }, title: summaryText, children: summaryText || "\u2014" }) })
      ] }, run.id);
    }) })
  ] });
}
function workspaceOptionLabel(workspace) {
  const title = workspace.title !== "" ? workspace.title : workspace.path;
  return title === workspace.path ? title : title + " \xB7 " + workspace.path;
}
function presetOptionLabel(preset) {
  const base = preset.name !== void 0 && preset.name !== "" ? preset.name : preset.id;
  return (preset.isDefault === true ? base + " \xB7 default" : base) + (preset.broken !== void 0 ? " \u26A0" : "");
}
function CreateForm({ form, setForm, showForm, setShowForm, busy, copy, onSubmit, editing, knownSessions, knownWorkspaces, knownPresets, defaultWorkspaceId }) {
  const targetIdRaw = (form.targetSessionId ?? "").trim();
  const [settledTargetId, setSettledTargetId] = (0, import_react.useState)(targetIdRaw);
  (0, import_react.useEffect)(() => {
    const timer = setTimeout(() => setSettledTargetId(targetIdRaw), 500);
    return () => {
      clearTimeout(timer);
    };
  }, [targetIdRaw]);
  if (!showForm) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Fragment, {});
  const kind = form.kind ?? "every";
  const mode = form.targetMode ?? "resume";
  const pickKind = (nextKind) => {
    if (nextKind === "every") setForm({ ...form, kind: nextKind, everySeconds: form.everySeconds ?? 3600 });
    else if (nextKind === "cron") setForm({ ...form, kind: nextKind, cron: form.cron ?? "" });
    else if (nextKind === "file") setForm({ ...form, kind: nextKind, scheduleFile: form.scheduleFile ?? "" });
    else setForm({ ...form, kind: nextKind, afterSeconds: form.afterSeconds ?? (form.atDate !== void 0 && form.atDate !== "" ? void 0 : 3600) });
  };
  const targetId = targetIdRaw;
  const sessionTargeted = mode === "resume" || mode === "fork";
  const source = sessionTargeted ? form.targetSource ?? "session" : void 0;
  const sessionSourced = source === "session";
  const targetInvalid = sessionTargeted && sessionSourced && targetId !== "" && !isValidSessionId(targetId);
  const targetTitle = sessionTargeted && sessionSourced && !targetInvalid && targetId !== "" ? knownSessions?.get(targetId) : void 0;
  const targetUnknown = sessionTargeted && sessionSourced && !targetInvalid && settledTargetId === targetId && targetId !== "" && knownSessions !== void 0 && knownSessions.size > 0 && !knownSessions.has(targetId);
  const workspaces = knownWorkspaces ?? [];
  const workspaceSelected = (form.targetWorkspaceId ?? "").trim();
  const workspaceMissing = sessionTargeted && source === "workspace" && workspaces.length === 0;
  const presets = knownPresets ?? [];
  const presetSelected = (form.targetPresetId ?? "").trim();
  const presetSourced = sessionTargeted && source === "preset";
  const canSubmit = (form.prompt ?? "").trim() !== "" && (kind !== "every" || (form.everySeconds ?? 0) >= 300) && (kind !== "cron" || (form.cron ?? "").trim() !== "") && (kind !== "once" || form.afterSeconds !== void 0 && (form.afterSeconds ?? 0) > 0 || (form.atDate ?? "") !== "" && (form.atTime ?? "") !== "") && (kind !== "file" || isScheduleFilePath(form.scheduleFile)) && (sessionTargeted && sessionSourced ? targetId !== "" && !targetInvalid : true) && (sessionTargeted && source === "workspace" ? workspaceSelected !== "" : true) && (presetSourced ? presetSelected !== "" : true);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dshp-card", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dshp-card-head", children: editing === true ? copy.edit : copy.newAlarm }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dshp-card-body", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dshp-field", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { className: "dshp-field-label", children: copy.prompt }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { className: "dshp-input dshp-grow", value: form.prompt ?? "", maxLength: MAX_PROMPT_LENGTH, placeholder: copy.promptPlaceholder, onChange: (e) => setForm({ ...form, prompt: e.target.value }) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dshp-field-row", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dshp-field", style: { flex: 1, minWidth: 220 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { className: "dshp-field-label", children: copy.type }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dshp-btn-row", children: ["once", "every", "cron", "file"].map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "dshp-btn dshp-btn-sm" + (kind === k ? " dshp-btn-primary" : ""), onClick: () => pickKind(k), children: typeLabel(copy, k) }, k)) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dshp-field", style: { flex: 1, minWidth: 220 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { className: "dshp-field-label", children: copy.jitterSeconds }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "input",
            {
              className: "dshp-input",
              type: "number",
              min: 0,
              max: 86400,
              step: 1,
              value: form.jitterSeconds ?? 0,
              placeholder: copy.jitterPlaceholder,
              onChange: (e) => {
                const value = Number(e.target.value);
                setForm({ ...form, jitterSeconds: Number.isFinite(value) ? Math.max(0, Math.min(86400, Math.floor(value))) : 0 });
              }
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dshp-cell-dim", children: copy.jitterEveryHint })
        ] })
      ] }),
      kind === "once" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dshp-field-row", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dshp-field", style: { flex: 1, minWidth: 160 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { className: "dshp-field-label", children: copy.delaySeconds }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "input",
            {
              className: "dshp-input",
              type: "number",
              min: 1,
              step: 1,
              value: form.afterSeconds ?? 3600,
              onChange: (e) => {
                const value = Number(e.target.value);
                setForm({ ...form, afterSeconds: Number.isFinite(value) && value > 0 ? Math.floor(value) : void 0, atDate: void 0, atTime: void 0 });
              }
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dshp-field", style: { flex: 1, minWidth: 200 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { className: "dshp-field-label", children: copy.atDateTime }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dshp-field-row", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { className: "dshp-input", type: "date", value: form.atDate ?? "", onChange: (e) => setForm({ ...form, atDate: e.target.value, afterSeconds: void 0 }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { className: "dshp-input", type: "time", value: form.atTime ?? "", onChange: (e) => setForm({ ...form, atTime: e.target.value, afterSeconds: void 0 }) })
          ] })
        ] })
      ] }) : kind === "file" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dshp-field", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { className: "dshp-field-label", children: copy.scheduleFile }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "input",
          {
            className: "dshp-input dshp-grow",
            value: form.scheduleFile ?? "",
            placeholder: copy.scheduleFilePlaceholder,
            onChange: (e) => setForm({ ...form, scheduleFile: e.target.value })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dshp-cell-dim", children: [
          copy.scheduleFileHint,
          (form.scheduleFile ?? "").trim() !== "" && !isScheduleFilePath(form.scheduleFile) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dshp-cell-dim", style: { marginLeft: 6 }, children: copy.scheduleFilePathInvalid }) : null
        ] })
      ] }) : kind === "every" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dshp-field", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { className: "dshp-field-label", children: copy.everySeconds }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "input",
          {
            className: "dshp-input",
            type: "number",
            min: 300,
            max: 31536e4,
            step: 1,
            value: form.everySeconds ?? 3600,
            onChange: (e) => {
              const value = Number(e.target.value);
              setForm({ ...form, everySeconds: Number.isFinite(value) ? Math.floor(value) : 0 });
            }
          }
        )
      ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dshp-field", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { className: "dshp-field-label", children: copy.cronExpression }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { className: "dshp-input dshp-grow", value: form.cron ?? "", placeholder: copy.cronPlaceholder, onChange: (e) => setForm({ ...form, cron: e.target.value }) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dshp-field", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "dshp-switch-row dshp-switch-label", style: { cursor: "pointer" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dshp-switch-label", children: copy.respectQuietHours }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dshp-switch-desc", children: copy.quietHint })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "dshp-switch", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", checked: form.respectQuietHours === true, onChange: (e) => setForm({ ...form, respectQuietHours: e.target.checked }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dshp-switch-track" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dshp-switch-thumb" })
        ] })
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dshp-field", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { className: "dshp-field-label", children: copy.minIdleSeconds }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "input",
          {
            className: "dshp-input",
            type: "number",
            min: 0,
            max: 86400,
            step: 1,
            value: form.minIdleSeconds ?? 0,
            placeholder: copy.minIdlePlaceholder,
            onChange: (e) => {
              const value = Number(e.target.value);
              setForm({ ...form, minIdleSeconds: Number.isFinite(value) ? Math.max(0, Math.min(86400, Math.floor(value))) : 0 });
            }
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dshp-cell-dim", children: copy.minIdleHint })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dshp-field-row", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dshp-field", style: { flex: 1, minWidth: 150 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { className: "dshp-field-label", children: copy.target }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            "select",
            {
              className: "dshp-input dshp-grow",
              value: mode,
              onChange: (e) => {
                const nextMode = e.target.value;
                setForm({
                  ...form,
                  targetMode: nextMode,
                  ...nextMode !== "new" && (form.targetSource ?? "session") === "workspace" && (form.targetWorkspaceId ?? "").trim() === "" && defaultWorkspaceId !== void 0 ? { targetWorkspaceId: defaultWorkspaceId } : {}
                });
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "resume", children: targetLabel(copy, "resume") }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "fork", children: targetLabel(copy, "fork") }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "new", children: targetLabel(copy, "new") })
              ]
            }
          ),
          mode === "new" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dshp-cell-dim", children: copy.newSessionHint }) : null
        ] }),
        sessionTargeted ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dshp-field", style: { flex: 1, minWidth: 180 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { className: "dshp-field-label", children: copy.targetSourceLabel }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            "select",
            {
              className: "dshp-input dshp-grow",
              value: source,
              onChange: (e) => {
                const nextSource = e.target.value;
                setForm({
                  ...form,
                  targetSource: nextSource,
                  ...nextSource === "workspace" && (form.targetWorkspaceId ?? "").trim() === "" && defaultWorkspaceId !== void 0 ? { targetWorkspaceId: defaultWorkspaceId } : {}
                });
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "session", children: sourceLabel(copy, "session") }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "workspace", children: sourceLabel(copy, "workspace") }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "preset", children: sourceLabel(copy, "preset") })
              ]
            }
          ),
          source === "preset" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dshp-cell-dim", children: copy.presetSourceHint }) : null
        ] }) : null,
        sessionTargeted && source === "workspace" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dshp-field", style: { flex: 2, minWidth: 260 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { className: "dshp-field-label", children: copy.targetWorkspaceLabel }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            "select",
            {
              className: "dshp-input dshp-grow",
              value: workspaceSelected,
              disabled: workspaces.length === 0,
              onChange: (e) => setForm({ ...form, targetWorkspaceId: e.target.value }),
              children: [
                workspaceSelected === "" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "", children: copy.workspacePickPlaceholder }) : null,
                workspaces.map((workspace) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: workspace.id, children: workspaceOptionLabel(workspace) }, workspace.id))
              ]
            }
          ),
          workspaceMissing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dshp-field-error", children: copy.noWorkspaces }) : null,
          mode === "resume" && !workspaceMissing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dshp-cell-dim", children: copy.workspaceHint }) : null
        ] }) : sessionTargeted && source === "preset" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dshp-field", style: { flex: 2, minWidth: 260 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { className: "dshp-field-label", children: copy.targetPresetLabel }),
          presets.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            "select",
            {
              className: "dshp-input dshp-grow",
              value: presetSelected,
              onChange: (e) => setForm({ ...form, targetPresetId: e.target.value }),
              children: [
                presetSelected === "" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "", children: copy.presetPickPlaceholder }) : null,
                presets.map((preset) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: preset.id, disabled: preset.broken !== void 0, children: presetOptionLabel(preset) }, preset.id))
              ]
            }
          ) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "input",
            {
              className: "dshp-input dshp-grow dshp-input-mono",
              value: form.targetPresetId ?? "",
              placeholder: copy.presetIdPlaceholder,
              spellCheck: false,
              autoComplete: "off",
              onChange: (e) => setForm({ ...form, targetPresetId: e.target.value })
            }
          ),
          presets.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dshp-cell-dim", children: copy.noPresets }) : null
        ] }) : sessionTargeted ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dshp-field", style: { flex: 2, minWidth: 260 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { className: "dshp-field-label", children: mode === "fork" ? copy.forkSourceSessionId : copy.targetSessionId }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "input",
            {
              className: "dshp-input dshp-grow dshp-input-mono",
              value: form.targetSessionId ?? "",
              placeholder: copy.targetSessionPlaceholder,
              spellCheck: false,
              autoComplete: "off",
              onChange: (e) => setForm({ ...form, targetSessionId: e.target.value })
            }
          ),
          targetInvalid ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dshp-field-error", children: copy.invalidSessionId }) : null,
          targetUnknown ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dshp-hint-warn", children: copy.unknownSession }) : null,
          targetTitle !== void 0 && targetTitle !== "" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dshp-cell-dim", children: targetTitle }) : null
        ] }) : null
      ] }),
      mode === "new" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dshp-field-row", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dshp-field", style: { flex: 1, minWidth: 200 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { className: "dshp-field-label", children: copy.newWorkspaceLabel }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            "select",
            {
              className: "dshp-input dshp-grow",
              value: workspaceSelected,
              disabled: workspaces.length === 0,
              onChange: (e) => setForm({ ...form, targetWorkspaceId: e.target.value }),
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "", children: "\u2014" }),
                workspaces.map((workspace) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: workspace.id, children: workspaceOptionLabel(workspace) }, workspace.id))
              ]
            }
          ),
          workspaces.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dshp-cell-dim", children: copy.noWorkspaces }) : null
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dshp-field", style: { flex: 1, minWidth: 200 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { className: "dshp-field-label", children: copy.newPresetLabel }),
          presets.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            "select",
            {
              className: "dshp-input dshp-grow",
              value: presetSelected,
              onChange: (e) => setForm({ ...form, targetPresetId: e.target.value }),
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "", children: "\u2014" }),
                presets.map((preset) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: preset.id, disabled: preset.broken !== void 0, children: presetOptionLabel(preset) }, preset.id))
              ]
            }
          ) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "input",
            {
              className: "dshp-input dshp-grow dshp-input-mono",
              value: form.targetPresetId ?? "",
              placeholder: copy.presetIdPlaceholder,
              spellCheck: false,
              autoComplete: "off",
              onChange: (e) => setForm({ ...form, targetPresetId: e.target.value })
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dshp-field", style: { flex: 1, minWidth: 160 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { className: "dshp-field-label", children: copy.providerPlaceholder }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "input",
            {
              className: "dshp-input dshp-grow dshp-input-mono",
              value: form.targetProvider ?? "",
              spellCheck: false,
              autoComplete: "off",
              onChange: (e) => setForm({ ...form, targetProvider: e.target.value })
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dshp-field", style: { flex: 1, minWidth: 160 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { className: "dshp-field-label", children: copy.modelPlaceholder }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "input",
            {
              className: "dshp-input dshp-grow dshp-input-mono",
              value: form.targetModel ?? "",
              spellCheck: false,
              autoComplete: "off",
              onChange: (e) => setForm({ ...form, targetModel: e.target.value })
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dshp-cell-dim", style: { alignSelf: "flex-end", flexBasis: "100%" }, children: copy.newConfigHint })
      ] }) : null,
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dshp-btn-row", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "dshp-btn dshp-btn-primary", disabled: busy || !canSubmit, onClick: onSubmit, children: editing === true ? copy.save : copy.create }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "dshp-btn", onClick: () => setShowForm(false), children: copy.cancel })
      ] })
    ] })
  ] });
}
function newAlarmForm(defaultPrompt, targetSessionId) {
  return { prompt: defaultPrompt, kind: "every", everySeconds: 3600, respectQuietHours: false, targetMode: "resume", targetSource: "session", targetSessionId };
}
function formFromAlarm(alarm) {
  const mode = alarm.targetMode === "fork" || alarm.targetMode === "new" ? alarm.targetMode : "resume";
  const legacyWorkspace = alarm.targetMode === "workspace";
  const source = mode === "new" || !legacyWorkspace ? alarm.targetSource === "workspace" || alarm.targetSource === "preset" ? alarm.targetSource : "session" : "workspace";
  const workspaceId = alarm.targetWorkspaceId !== void 0 && alarm.targetWorkspaceId !== "" ? alarm.targetWorkspaceId : void 0;
  const presetId = alarm.targetPresetId !== void 0 && alarm.targetPresetId !== "" ? alarm.targetPresetId : void 0;
  const next = {
    prompt: alarm.prompt,
    kind: alarm.type === "every" ? "every" : alarm.type === "cron" ? "cron" : alarm.type === "file" ? "file" : "once",
    ...alarm.type === "file" ? { scheduleFile: alarm.scheduleFile ?? "" } : {},
    respectQuietHours: alarm.respectQuietHours,
    compaction: alarm.compaction,
    ...alarm.minIdleSeconds !== void 0 && alarm.minIdleSeconds > 0 ? { minIdleSeconds: alarm.minIdleSeconds } : {},
    targetMode: mode,
    ...mode !== "new" ? { targetSource: source } : {},
    ...mode !== "new" && source === "session" && alarm.targetSessionId !== void 0 && alarm.targetSessionId !== "" ? { targetSessionId: alarm.targetSessionId } : {},
    ...workspaceId !== void 0 ? { targetWorkspaceId: workspaceId } : {},
    ...presetId !== void 0 ? { targetPresetId: presetId } : {},
    ...mode === "new" && alarm.targetProvider !== void 0 && alarm.targetProvider !== "" ? { targetProvider: alarm.targetProvider } : {},
    ...mode === "new" && alarm.targetModel !== void 0 && alarm.targetModel !== "" ? { targetModel: alarm.targetModel } : {}
  };
  if (alarm.type === "every") {
    next.everySeconds = alarm.everySeconds ?? 3600;
    if (alarm.jitterSeconds !== void 0 && alarm.jitterSeconds > 0) next.jitterSeconds = alarm.jitterSeconds;
  } else if (alarm.type === "cron") {
    next.cron = alarm.cron ?? "";
    if (alarm.jitterSeconds !== void 0 && alarm.jitterSeconds > 0) next.jitterSeconds = alarm.jitterSeconds;
  } else if (alarm.at !== void 0) {
    const remaining = Math.max(1, Math.floor((new Date(alarm.at).getTime() - Date.now()) / 1e3));
    next.afterSeconds = remaining;
    if (alarm.jitterSeconds !== void 0 && alarm.jitterSeconds > 0) next.jitterSeconds = alarm.jitterSeconds;
  } else {
    next.afterSeconds = 3600;
  }
  return next;
}
function LoadingBlock({ copy }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dshp-loading", role: "status", "aria-live": "polite", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dshp-spinner", "aria-hidden": "true" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: copy.loading })
  ] });
}

// src/client/use-locale.ts
var import_react2 = require("react");

// src/client/locales.ts
var zh = {
  tabLabel: "\u4E3B\u52A8\u5524\u9192",
  globalTitle: "\u4E3B\u52A8\u5524\u9192 \xB7 \u5168\u5C40",
  sessionTitle: "\u4E3B\u52A8\u5524\u9192",
  sessionSubtitle: "\u672C\u4F1A\u8BDD\u7684\u95F9\u949F\u4E0E\u5524\u9192\u5386\u53F2\u3002",
  refresh: "\u5237\u65B0",
  newAlarm: "\u65B0\u5EFA\u95F9\u949F",
  create: "\u521B\u5EFA",
  save: "\u4FDD\u5B58",
  cancel: "\u53D6\u6D88",
  pause: "\u6682\u505C",
  resume: "\u6062\u590D",
  fire: "\u7ACB\u5373\u89E6\u53D1",
  edit: "\u7F16\u8F91",
  history: "\u5386\u53F2",
  hideHistory: "\u6536\u8D77",
  copyId: "\u590D\u5236\u4F1A\u8BDD ID",
  copied: "\u5DF2\u590D\u5236",
  alarmsTitle: "\u95F9\u949F",
  alarms: "\u95F9\u949F",
  session: "\u6240\u5C5E\u4F1A\u8BDD",
  prompt: "\u5524\u9192\u6307\u4EE4",
  promptPlaceholder: "\u4F8B\u5982\uFF1A\u786E\u8BA4\u4ECA\u5929\u7684\u5F85\u529E\u8FDB\u5EA6",
  state: "\u72B6\u6001",
  nextDue: "\u4E0B\u6B21\u89E6\u53D1",
  type: "\u7C7B\u578B",
  target: "\u76EE\u6807",
  emptyAlarms: "\u6682\u65E0\u95F9\u949F\u3002\u521B\u5EFA\u4E00\u4E2A\uFF0C\u6A21\u578B\u5230\u70B9\u4F1A\u4E3B\u52A8\u8DDF\u8FDB\u3002",
  emptyRuns: "\u8FD8\u6CA1\u6709\u5524\u9192\u8BB0\u5F55\u3002",
  filterActive: "\u6D3B\u8DC3\u4E2D",
  filterAllStates: "\u5168\u90E8\u72B6\u6001",
  filterAllSessions: "\u5168\u90E8\u4F1A\u8BDD",
  filterAllTypes: "\u5168\u90E8\u7C7B\u578B",
  sortBy: "\u6392\u5E8F",
  sortNextDue: "\u4E0B\u6B21\u89E6\u53D1",
  sortCreated: "\u521B\u5EFA\u65F6\u95F4",
  sortPrompt: "\u6307\u4EE4",
  stateScheduled: "\u5F85\u89E6\u53D1",
  stateOverdue: "\u5DF2\u5230\u671F",
  stateInFlight: "\u6267\u884C\u4E2D",
  stateCompleted: "\u5DF2\u5B8C\u6210",
  stateCancelled: "\u5DF2\u53D6\u6D88",
  stateFailed: "\u5931\u8D25",
  statePaused: "\u5DF2\u6682\u505C",
  typeOnce: "\u5355\u6B21",
  typeEvery: "\u5FAA\u73AF",
  typeCron: "Cron",
  typeFile: "\u6587\u4EF6\u8868",
  scheduleFile: "\u65F6\u95F4\u8868\u6587\u4EF6",
  scheduleFilePlaceholder: "/\u7EDD\u5BF9\u8DEF\u5F84/wake_schedule.json",
  scheduleFileHint: "\u8BE5\u6587\u4EF6\u91CC\u7684\u6BCF\u6761 entry \u4F1A\u540C\u6B65\u6210\u4E00\u4E2A\u5B50\u95F9\u949F\uFF1B\u6587\u4EF6\u662F\u552F\u4E00\u771F\u6E90\uFF0C\u6539\u6761\u76EE\u5373\u6539\u95F9\u949F\u3002",
  declaredEntries: "\u6761\u76EE",
  syncLast: "\u6587\u4EF6\u8868\u540C\u6B65",
  scheduleFilePathInvalid: "\u9700\u4E3A\u7EDD\u5BF9\u8DEF\u5F84\u4E14\u4E0D\u542B * \u6216 ?",
  targetResume: "\u4F1A\u8BDD",
  targetFork: "\u5206\u652F",
  targetNew: "\u65B0\u5EFA",
  targetWorkspace: "\u5DE5\u4F5C\u533A",
  targetSourceLabel: "\u6765\u6E90",
  sourceSession: "\u4F1A\u8BDD ID",
  sourceWorkspace: "\u5DE5\u4F5C\u533A\u6700\u8FD1\u6D3B\u8DC3",
  sourcePreset: "Preset \u6700\u8FD1\u6D3B\u8DC3",
  presetSourceHint: "\u5524\u9192\u6295\u9012\u5230\u8FD0\u884C\u8BE5 preset \u7684\u6700\u8FD1\u6D3B\u8DC3\u4F1A\u8BDD\uFF1B\u672C\u63D2\u4EF6\u81EA\u5EFA\u7684\u4F1A\u8BDD\u6C38\u4E0D\u5165\u9009\uFF0C\u65E0\u5408\u683C\u4F1A\u8BDD\u65F6\u8DF3\u8FC7\u672C\u6B21\u89E6\u53D1\uFF08\u4E0D\u65B0\u5EFA\uFF09\uFF0C\u5206\u652F\u5219\u5931\u8D25\u3002",
  targetWorkspaceLabel: "\u76EE\u6807\u5DE5\u4F5C\u533A",
  workspaceHint: "\u5524\u9192\u4F1A\u6295\u9012\u5230\u8BE5\u5DE5\u4F5C\u533A\u6700\u8FD1\u66F4\u65B0\u7684\u4F1A\u8BDD\uFF1B\u672C\u63D2\u4EF6\u81EA\u5EFA\u7684\u4F1A\u8BDD\u6C38\u4E0D\u5165\u9009\uFF0C\u65E0\u5408\u683C\u4F1A\u8BDD\u65F6\u8DF3\u8FC7\u672C\u6B21\u89E6\u53D1\uFF08\u4E0D\u65B0\u5EFA\uFF09\u3002",
  workspacePickPlaceholder: "\u9009\u62E9\u5DE5\u4F5C\u533A\u2026",
  noWorkspaces: "\u6682\u65E0\u5DF2\u6CE8\u518C\u5DE5\u4F5C\u533A\uFF08\u5148\u628A\u76EE\u5F55\u6CE8\u518C\u4E3A\u5DE5\u4F5C\u533A\uFF0C\u89C1\u4FA7\u8FB9\u680F\uFF09",
  targetPresetLabel: "\u76EE\u6807 preset",
  presetPickPlaceholder: "\u9009\u62E9 preset\u2026",
  presetIdPlaceholder: "preset id",
  noPresets: "\u4E3B\u673A\u672A\u63D0\u4F9B preset \u5217\u8868\uFF0C\u53EF\u624B\u52A8\u8F93\u5165 preset id",
  newWorkspaceLabel: "\u5DE5\u4F5C\u533A\uFF08\u53EF\u9009\uFF09",
  newPresetLabel: "Preset\uFF08\u53EF\u9009\uFF09",
  newModelLabel: "\u6A21\u578B\uFF08\u53EF\u9009\uFF09",
  newConfigHint: "\u53EF\u9009\u914D\u7F6E\uFF1A\u5DE5\u4F5C\u533A\u51B3\u5B9A\u4F1A\u8BDD\u76EE\u5F55\uFF0Cpreset \u51B3\u5B9A\u7EC4\u5408\uFF0C\u6A21\u578B\u51B3\u5B9A\u5524\u9192\u56DE\u5408\u6240\u7528\u7684 LLM\uFF08\u5168\u90E8\u7559\u7A7A = \u4E3B\u673A\u9ED8\u8BA4\uFF09\u3002",
  providerPlaceholder: "provider\uFF0C\u5982 deepseek",
  modelPlaceholder: "model id",
  quietLabel: "\u514D\u6253\u6270",
  runTime: "\u65F6\u95F4",
  runDecision: "\u51B3\u7B56",
  runBudget: "\u9884\u7B97",
  runSummary: "\u6458\u8981\uFF08\u601D\u8003 / \u56DE\u590D\uFF09",
  thinkingPrefix: "\u601D\u8003\uFF1A",
  replyPrefix: "\u56DE\u590D\uFF1A",
  delaySeconds: "\u5EF6\u8FDF\u79D2\u6570\uFF08\u4ECE\u73B0\u5728\u8D77\uFF09",
  atDateTime: "\u6307\u5B9A\u65E5\u671F\u65F6\u95F4",
  everySeconds: "\u56FA\u5B9A\u95F4\u9694\u79D2\u6570",
  cronExpression: "Cron \u8868\u8FBE\u5F0F",
  cronPlaceholder: "5 \u6BB5\uFF0C\u5982 0 9 * * 1-5\uFF08\u5206 \u65F6 \u65E5 \u6708 \u5468\uFF09",
  jitterSeconds: "\u968F\u673A\u6296\u52A8\uFF08\u79D2\uFF09",
  jitterPlaceholder: "0 = \u51C6\u65F6\u89E6\u53D1",
  jitterEveryHint: "\u5EFA\u8BAE \u2264 \u95F4\u9694\u79D2\u6570",
  minIdleSeconds: "\u5524\u9192\u524D\u4F1A\u8BDD\u9700\u9759\u9ED8\uFF08\u79D2\uFF09",
  minIdlePlaceholder: "0 = \u5230\u70B9\u5373\u5524\u9192",
  minIdleHint: "\u4EC5 resume \u76EE\u6807\uFF1A\u76EE\u6807\u4F1A\u8BDD\u6700\u8FD1\u4E00\u6B21\u6D3B\u52A8\uFF08\u542B\u4E0A\u6B21\u5524\u9192\uFF09\u8DDD\u4ECA\u4E0D\u8DB3\u8BE5\u79D2\u6570\u65F6\u987A\u5EF6\u5524\u9192\uFF1B\u6709\u6548\u4E0B\u9650 60 \u79D2\uFF08\u6BCF\u5206\u949F\u6700\u591A\u590D\u67E5\u4E00\u6B21\uFF09\uFF0C<60 \u6548\u679C\u540C 60\uFF1B\u51B7\u4F1A\u8BDD\u89C6\u4E3A\u5DF2\u9759\u9ED8\uFF1Bfork/new \u5FFD\u7565",
  respectQuietHours: "\u9075\u4ECE\u514D\u6253\u6270\u65F6\u6BB5",
  quietHint: "\u4E0D\u52FE\u9009 = \u4F60\u660E\u786E\u8981\u6C42\uFF1A\u514D\u6253\u6270\u65F6\u6BB5\u4E5F\u7167\u5E38\u89E6\u53D1\uFF0C\u4E14\u4E0D\u53D7\u6BCF\u65E5\u9884\u7B97\u9650\u5236\uFF1B\u52FE\u9009 = \u5B89\u9759\u65F6\u6BB5\u5185\u7684\u89E6\u53D1\u4F1A\u88AB\u8DF3\u8FC7\uFF0C\u63A8\u8FDB\u5230\u7A97\u5916\u4E0B\u4E00\u4E2A\u89E6\u53D1\u70B9",
  targetSessionId: "\u76EE\u6807\u4F1A\u8BDD ID",
  forkSourceSessionId: "\u5206\u652F\u6E90\u4F1A\u8BDD ID",
  targetSessionPlaceholder: "\u5982 session-\u2026\uFF08\u9ED8\u8BA4\u5F53\u524D\u4F1A\u8BDD\uFF09",
  invalidSessionId: "\u4F1A\u8BDD ID \u683C\u5F0F\u4E0D\u5BF9\uFF1A\u53EA\u80FD\u5305\u542B\u5B57\u6BCD\u3001\u6570\u5B57\u4E0E . _ -",
  unknownSession: "\u6B64 ID \u4E0D\u5728\u5F53\u524D\u4F1A\u8BDD\u5217\u8868\u4E2D\u2014\u2014\u82E5\u662F\u7B14\u8BEF\u8BF7\u66F4\u6B63\uFF1B\u786E\u8BA4\u65E0\u8BEF\u53EF\u7EE7\u7EED",
  decisionNoReply: "\u9759\u9ED8",
  decisionReply: "\u5DF2\u56DE\u590D",
  decisionSkipped: "\u8DF3\u8FC7",
  decisionFailed: "\u5931\u8D25",
  newSessionHint: "\u5524\u9192\u65F6\u65B0\u5EFA\u4E00\u4E2A\u7A7A\u4F1A\u8BDD\uFF0C\u4E0D\u4F9D\u8D56\u4EFB\u4F55\u65E2\u6709\u4F1A\u8BDD",
  budget: "\u6BCF\u65E5\u9884\u7B97",
  perDay: "/\u65E5",
  quietHours: "\u5B89\u9759\u65F6\u6BB5",
  quietHoursStart: "\u5B89\u9759\u65F6\u6BB5\u5F00\u59CB",
  quietHoursEnd: "\u5B89\u9759\u65F6\u6BB5\u7ED3\u675F",
  globalView: "\u5168\u5C40\u89C6\u56FE",
  configSectionTitle: "\u5168\u5C40\u914D\u7F6E",
  configSectionDesc: "",
  enabledToggle: "\u542F\u7528\u4E3B\u52A8\u5524\u9192",
  silentWakeCompactionToggle: "\u9759\u9ED8\u5524\u9192\u5893\u7891\u538B\u7F29",
  silentWakeCompactionHint: "\u5173 = \u9759\u9ED8\u5524\u9192\u5728\u4E0A\u4E0B\u6587\u91CC\u4FDD\u7559\u5B8C\u6574\u4EA4\u6362\uFF1B\u5F00 = \u6298\u53E0\u6210\u4E00\u884C\u5893\u7891\uFF08\u6BCF\u4E2A\u95F9\u949F\u53EF\u518D\u7EC6\u5316\uFF09",
  defaultPromptLabel: "\u9ED8\u8BA4\u5524\u9192\u6307\u4EE4",
  defaultPromptHint: "\u65B0\u5EFA\u95F9\u949F\u65F6\u9884\u586B\u8FD9\u6BB5\u6587\u5B57\uFF1B\u6BCF\u4E2A\u95F9\u949F\u4ECD\u4FDD\u5B58\u81EA\u5DF1\u7684\u6307\u4EE4",
  saveConfig: "\u4FDD\u5B58\u914D\u7F6E",
  saved: "\u5DF2\u4FDD\u5B58",
  loading: "\u52A0\u8F7D\u4E2D\u2026",
  close: "\u5173\u95ED",
  openSettings: "\u6253\u5F00\u8BBE\u7F6E",
  error: "\u51FA\u9519\u4E86",
  confirmCancel: "\u786E\u8BA4\u53D6\u6D88\u8FD9\u4E2A\u95F9\u949F\uFF1F",
  storageCorrupt: "\uFF08\u5B58\u50A8\u635F\u574F\uFF0C\u53EA\u8BFB\uFF09",
  hostPanelLabel: "\u5168\u5C40\uFF08\u8BBE\u7F6E\u9875\uFF09",
  dateTimeLocale: "zh-CN"
};
var en = {
  tabLabel: "Proactive",
  globalTitle: "Proactive \xB7 Global",
  sessionTitle: "Proactive",
  sessionSubtitle: "Alarms and wake history for this session.",
  refresh: "Refresh",
  newAlarm: "New alarm",
  create: "Create",
  save: "Save",
  cancel: "Cancel",
  pause: "Pause",
  resume: "Resume",
  fire: "Fire now",
  edit: "Edit",
  history: "History",
  hideHistory: "Hide",
  copyId: "Copy session ID",
  copied: "Copied",
  alarmsTitle: "Alarms",
  alarms: "alarms",
  session: "Owner session",
  prompt: "Wake-up instruction",
  promptPlaceholder: "e.g. check on today's todo progress",
  state: "State",
  nextDue: "Next due",
  type: "Type",
  target: "Target",
  emptyAlarms: "No alarms yet. Create one and the model will proactively follow up on schedule.",
  emptyRuns: "No wake runs yet.",
  filterActive: "Active",
  filterAllStates: "All states",
  filterAllSessions: "All sessions",
  filterAllTypes: "All types",
  sortBy: "Sort by",
  sortNextDue: "Next due",
  sortCreated: "Created",
  sortPrompt: "Prompt",
  stateScheduled: "Scheduled",
  stateOverdue: "Overdue",
  stateInFlight: "In-flight",
  stateCompleted: "Completed",
  stateCancelled: "Cancelled",
  stateFailed: "Failed",
  statePaused: "Paused",
  typeOnce: "Once",
  typeEvery: "Repeat",
  typeCron: "Cron",
  typeFile: "File schedule",
  scheduleFile: "Schedule file",
  scheduleFilePlaceholder: "/absolute/path/wake_schedule.json",
  scheduleFileHint: "Every entry in this file becomes a child alarm; the file is the single source of truth.",
  declaredEntries: "entries",
  syncLast: "File sync",
  scheduleFilePathInvalid: "must be an absolute path without * or ?",
  targetResume: "Session",
  targetFork: "Fork",
  targetNew: "New",
  targetWorkspace: "Workspace",
  targetSourceLabel: "Source",
  sourceSession: "Session id",
  sourceWorkspace: "Workspace recent",
  sourcePreset: "Preset recent",
  presetSourceHint: "The wake lands in the most recently active session running this preset; sessions this plugin created never match \u2014 with no eligible session the fire is skipped (none is created), and fork fails.",
  targetWorkspaceLabel: "Target workspace",
  workspaceHint: "The wake lands in the workspace's most recently updated session; sessions this plugin created never match \u2014 with no eligible session the fire is skipped (none is created).",
  workspacePickPlaceholder: "Pick a workspace\u2026",
  noWorkspaces: "No registered workspaces yet (register a directory as one in the sidebar first)",
  targetPresetLabel: "Target preset",
  presetPickPlaceholder: "Pick a preset\u2026",
  presetIdPlaceholder: "preset id",
  noPresets: "No preset roster from the host; type a preset id manually",
  newWorkspaceLabel: "Workspace (optional)",
  newPresetLabel: "Preset (optional)",
  newModelLabel: "Model (optional)",
  newConfigHint: "Optional: the workspace sets the session directory, the preset its composition, the model its LLM (all empty = host defaults).",
  providerPlaceholder: "provider, e.g. deepseek",
  modelPlaceholder: "model id",
  quietLabel: "Quiet",
  runTime: "Time",
  runDecision: "Decision",
  runBudget: "Budget",
  runSummary: "Summary (thinking / reply)",
  thinkingPrefix: "Thinking: ",
  replyPrefix: "Reply: ",
  delaySeconds: "Delay seconds (from now)",
  atDateTime: "Pick date & time",
  everySeconds: "Fixed interval seconds",
  cronExpression: "Cron expression",
  cronPlaceholder: "5 fields, e.g. 0 9 * * 1-5 (min hour dom month dow)",
  jitterSeconds: "Jitter seconds",
  jitterPlaceholder: "0 = exact",
  jitterEveryHint: "should be \u2264 interval",
  minIdleSeconds: "Min destination idle (seconds)",
  minIdlePlaceholder: "0 = wake on schedule",
  minIdleHint: "Resume targets only: the wake defers while the destination's latest activity (including earlier wakes) is closer than this; effective floor 60s (re-checked at most once a minute, so <60 behaves as 60); cold sessions count as idle; ignored for fork/new",
  respectQuietHours: "Respect quiet hours",
  quietHint: "Unchecked = your explicit request: fires even in quiet hours, exempt from the daily budget; checked = occurrences inside quiet hours are skipped and repeating alarms advance past the window",
  targetSessionId: "Target session ID",
  forkSourceSessionId: "Fork source session ID",
  targetSessionPlaceholder: "e.g. session-\u2026 (defaults to the current session)",
  invalidSessionId: "Invalid session ID: only letters, digits, and . _ - are allowed",
  unknownSession: "This id is not in the session list \u2014 fix a typo or continue if intentional",
  decisionNoReply: "silent",
  decisionReply: "replied",
  decisionSkipped: "skipped",
  decisionFailed: "failed",
  newSessionHint: "The wake runs in a fresh empty session.",
  budget: "Daily budget",
  perDay: "/day",
  quietHours: "Quiet hours",
  quietHoursStart: "Quiet hours start",
  quietHoursEnd: "Quiet hours end",
  globalView: "Global view",
  configSectionTitle: "Global config",
  configSectionDesc: "",
  enabledToggle: "Enable proactive wakes",
  silentWakeCompactionToggle: "Silent-wake tombstone compaction",
  silentWakeCompactionHint: "Off = silent wakes keep the full exchange in context; on = collapse to a one-line tombstone (per-alarm still fine-tunes)",
  defaultPromptLabel: "Default wake-up instruction",
  defaultPromptHint: "Pre-filled into the new-alarm form; each alarm still stores its own prompt",
  saveConfig: "Save config",
  saved: "Saved",
  loading: "Loading\u2026",
  close: "Close",
  openSettings: "Open settings",
  error: "Error",
  confirmCancel: "Cancel this alarm?",
  storageCorrupt: "(storage corrupt, read-only)",
  hostPanelLabel: "Global (settings page)",
  dateTimeLocale: "en-US"
};

// src/client/use-locale.ts
var bound = null;
var listeners = /* @__PURE__ */ new Set();
function resolveLanguage() {
  const active = bound?.getSnapshot().active;
  return typeof active === "string" && (active === "en" || active.startsWith("en")) ? "en" : "zh";
}
function bindProactiveLocale(face) {
  bound = face;
  for (const fn of listeners) fn();
}
function subscribe(fn) {
  listeners.add(fn);
  const unsubscribe = bound?.subscribe(fn);
  return () => {
    listeners.delete(fn);
    unsubscribe?.();
  };
}
function getSnapshot() {
  return resolveLanguage() === "en" ? en : zh;
}
function useProactiveLocale() {
  return (0, import_react2.useSyncExternalStore)(subscribe, getSnapshot, getSnapshot);
}

// src/client/style.ts
var injected = false;
var cachedStyle = null;
function injectProactiveStyles() {
  if (injected) return;
  injected = true;
  const style = document.createElement("style");
  style.textContent = STYLESHEET;
  cachedStyle = style;
  (document.head ?? document.documentElement).appendChild(style);
}
var STYLESHEET = String.raw`
.dshp-panel {
  --dshp-radius: 10px;
  --dshp-gap: 14px;
  --dshp-border: var(--dsw-alias-border-l1, #e4e4e7);
  --dshp-border-strong: var(--dsw-alias-border-l2, #d4d4d8);
  --dshp-bg: var(--dsw-alias-bg-layer-1, #ffffff);
  --dshp-bg-alt: var(--dsw-alias-bg-layer-2, #fafafa);
  --dshp-text: var(--dsw-alias-label-primary, #18181b);
  --dshp-text-secondary: var(--dsw-alias-label-secondary, #3f3f46);
  --dshp-text-tertiary: var(--dsw-alias-label-tertiary, #71717a);
  --dshp-text-dimmed: var(--dsw-alias-label-dimmed, #a1a1aa);
  --dshp-accent: var(--dsw-alias-brand-primary, #4f46e5);
  --dshp-success: var(--dsw-alias-state-success-primary, #16a34a);
  --dshp-error: var(--dsw-alias-state-error-primary, #dc2626);
  --dshp-warn: var(--dsw-alias-state-warn-label, #d97706);
  --dshp-font: var(--dsw-font-family, system-ui, -apple-system, "Segoe UI", sans-serif);
  --dshp-font-mono: var(--ds-font-family-code, ui-monospace, "SFMono-Regular", Menlo, monospace);
  font-family: var(--dshp-font);
  color: var(--dshp-text);
  font-size: 13px;
  line-height: 1.55;
  display: flex;
  flex-direction: column;
  gap: var(--dshp-gap);
}

/* ---------- conversation.view tab container ---------- */
/* The settings section's host container already pads itself (24px sides), but
   the conversation.view host area (.wSkVaW_viewArea) has zero padding — without
   this the tab content sits flush against the view edges. Scoped to the session
   panel only so the settings page never double-pads. */
.dshp-panel.dshp-panel-session {
  padding: 16px 16px 28px;
}

/* ---------- header ---------- */
.dshp-panel .dshp-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
.dshp-panel .dshp-title {
  font-size: 15px;
  font-weight: 600;
  margin: 0;
  letter-spacing: 0.01em;
}
.dshp-panel .dshp-sub {
  color: var(--dshp-text-tertiary);
  font-size: 12px;
}

/* ---------- cards ---------- */
.dshp-panel .dshp-card {
  background: var(--dshp-bg);
  border: 1px solid var(--dshp-border);
  border-radius: var(--dshp-radius);
  overflow: hidden;
}
.dshp-panel .dshp-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--dshp-border);
  background: var(--dshp-bg-alt);
  font-weight: 600;
  font-size: 12.5px;
  letter-spacing: 0.02em;
}
.dshp-panel .dshp-card-body {
  padding: 12px 14px;
}

/* ---------- table ---------- */
.dshp-panel .dshp-table-wrap {
  overflow-x: auto;
}
.dshp-panel table.dshp-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12.5px;
}
.dshp-panel .dshp-table th {
  text-align: left;
  padding: 8px 10px;
  font-weight: 600;
  color: var(--dshp-text-secondary);
  border-bottom: 1px solid var(--dshp-border-strong);
  background: var(--dshp-bg-alt);
  white-space: nowrap;
  font-size: 12px;
  letter-spacing: 0.02em;
}
.dshp-panel .dshp-table td {
  padding: 8px 10px;
  border-bottom: 1px solid var(--dshp-border);
  vertical-align: top;
}
.dshp-panel .dshp-table tbody tr:last-child td {
  border-bottom: none;
}
.dshp-panel .dshp-table tbody tr:hover td {
  background: color-mix(in srgb, var(--dshp-bg-alt) 60%, transparent);
}
.dshp-panel .dshp-cell-main {
  max-width: 340px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dshp-panel .dshp-cell-dim {
  color: var(--dshp-text-tertiary);
  font-size: 12px;
}
.dshp-panel .dshp-cell-mono {
  font-family: var(--dshp-font-mono);
  font-size: 11.5px;
  color: var(--dshp-text-secondary);
}

/* ---------- pills / badges ---------- */
.dshp-panel .dshp-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 1px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  line-height: 18px;
  white-space: nowrap;
  border: 1px solid transparent;
}
.dshp-panel .dshp-pill-plain { background: var(--dshp-bg-alt); border-color: var(--dshp-border); color: var(--dshp-text-secondary); }
.dshp-panel .dshp-pill-accent { background: color-mix(in srgb, var(--dshp-accent) 12%, transparent); color: var(--dshp-accent); }
.dshp-panel .dshp-pill-success { background: color-mix(in srgb, var(--dshp-success) 12%, transparent); color: var(--dshp-success); }
.dshp-panel .dshp-pill-warn { background: color-mix(in srgb, var(--dshp-warn) 12%, transparent); color: var(--dshp-warn); }
.dshp-panel .dshp-pill-error { background: color-mix(in srgb, var(--dshp-error) 10%, transparent); color: var(--dshp-error); }

/* ---------- buttons ---------- */
.dshp-panel .dshp-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 11px;
  font-size: 12px;
  font-weight: 500;
  font-family: inherit;
  border-radius: 7px;
  border: 1px solid var(--dshp-border-strong);
  background: var(--dshp-bg);
  color: var(--dshp-text-secondary);
  cursor: pointer;
  transition: background 0.12s ease, border-color 0.12s ease, color 0.12s ease;
  white-space: nowrap;
}
.dshp-panel .dshp-btn:hover:not(:disabled) {
  background: var(--dshp-bg-alt);
  border-color: var(--dsw-alias-border-l3, #a1a1aa);
}
.dshp-panel .dshp-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.dshp-panel .dshp-btn-primary {
  background: var(--dshp-accent);
  border-color: var(--dshp-accent);
  color: #fff;
}
.dshp-panel .dshp-btn-primary:hover:not(:disabled) { filter: brightness(1.06); background: var(--dshp-accent); }
.dshp-panel .dshp-btn-danger { color: var(--dshp-error); }
.dshp-panel .dshp-btn-danger:hover:not(:disabled) {
  background: color-mix(in srgb, var(--dshp-error) 8%, transparent);
  border-color: var(--dshp-error);
}
.dshp-panel .dshp-btn-sm { padding: 2px 8px; font-size: 11.5px; border-radius: 6px; }
.dshp-panel .dshp-btn-row { display: inline-flex; gap: 6px; }

/* ---------- form ---------- */
.dshp-panel .dshp-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 10px;
}
.dshp-panel .dshp-field-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--dshp-text-secondary);
}
.dshp-panel .dshp-field-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.dshp-panel input.dshp-input,
.dshp-panel select.dshp-input {
  font-family: inherit;
  font-size: 12.5px;
  padding: 5px 8px;
  border-radius: 7px;
  border: 1px solid var(--dshp-border-strong);
  background: var(--dshp-bg);
  color: var(--dshp-text);
  outline: none;
  transition: border-color 0.12s ease, box-shadow 0.12s ease;
  max-width: 100%;
}
.dshp-panel input.dshp-input:focus,
.dshp-panel select.dshp-input:focus {
  border-color: var(--dshp-accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--dshp-accent) 18%, transparent);
}
.dshp-panel input.dshp-input[type="number"] { width: 110px; }
.dshp-panel input.dshp-input.dshp-grow { flex: 1; min-width: 200px; }
.dshp-panel label.dshp-check {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  cursor: pointer;
  user-select: none;
}

/* ---------- section helper classes ---------- */
.dshp-panel .dshp-empty {
  padding: 18px 14px;
  text-align: center;
  color: var(--dshp-text-dimmed);
  font-size: 12.5px;
}
.dshp-panel .dshp-error {
  color: var(--dshp-error);
  font-size: 12.5px;
  padding: 8px 12px;
  border: 1px solid color-mix(in srgb, var(--dshp-error) 30%, transparent);
  background: color-mix(in srgb, var(--dshp-error) 6%, transparent);
  border-radius: 8px;
}
.dshp-panel .dshp-meta {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  color: var(--dshp-text-tertiary);
  font-size: 12px;
}
.dshp-panel .dshp-meta b { color: var(--dshp-text-secondary); font-weight: 600; }
.dshp-panel .dshp-switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid var(--dshp-border);
}
.dshp-panel .dshp-switch-row:last-child { border-bottom: none; }
.dshp-panel .dshp-switch-label { font-size: 12.5px; font-weight: 600; }
.dshp-panel .dshp-switch-desc { color: var(--dshp-text-tertiary); font-size: 12px; margin-top: 2px; }
.dshp-panel .dshp-switch {
  position: relative;
  width: 34px;
  height: 20px;
  flex: none;
  cursor: pointer;
}
.dshp-panel .dshp-switch input { opacity: 0; width: 0; height: 0; position: absolute; }
.dshp-panel .dshp-switch-track {
  position: absolute;
  inset: 0;
  border-radius: 999px;
  background: var(--dshp-border-strong);
  transition: background 0.15s ease;
}
.dshp-panel .dshp-switch input:checked + .dshp-switch-track { background: var(--dshp-accent); }
.dshp-panel .dshp-switch-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0,0,0,0.2);
  transition: transform 0.15s ease;
}
.dshp-panel .dshp-switch input:checked + .dshp-switch-track + .dshp-switch-thumb { transform: translateX(14px); }

/* ---------- alarm table toolbar (filter / sort) ---------- */
.dshp-panel .dshp-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 8px 10px;
  border-bottom: 1px solid var(--dshp-border);
  background: var(--dshp-bg-alt);
}
.dshp-panel .dshp-toolbar select.dshp-input {
  width: auto;
  min-width: 110px;
  font-size: 12px;
  padding: 4px 6px;
}

/* ---------- session cell + copy button ---------- */
.dshp-panel .dshp-session-cell {
  display: inline-flex;
  align-items: center;
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;
}
.dshp-panel .dshp-copy-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 5px;
  padding: 1px 5px;
  font-size: 12px;
  line-height: 16px;
  border: 1px solid transparent;
  border-radius: 5px;
  background: transparent;
  color: var(--dshp-text-dimmed);
  cursor: pointer;
  vertical-align: middle;
  transition: background 0.12s ease, color 0.12s ease, border-color 0.12s ease;
}
.dshp-panel .dshp-copy-btn:hover {
  color: var(--dshp-accent);
  background: color-mix(in srgb, var(--dshp-accent) 10%, transparent);
  border-color: color-mix(in srgb, var(--dshp-accent) 30%, transparent);
}

/* ---------- per-alarm history expansion ---------- */
.dshp-panel .dshp-history-row td {
  background: var(--dshp-bg-alt);
  padding: 10px 12px;
}
.dshp-panel table.dshp-table.dshp-table-sub {
  border: 1px solid var(--dshp-border);
  border-radius: 8px;
  overflow: hidden;
}
.dshp-panel table.dshp-table.dshp-table-sub th:first-child { border-top-left-radius: 8px; }
.dshp-panel table.dshp-table.dshp-table-sub th:last-child { border-top-right-radius: 8px; }

/* ---------- toast (copy feedback) ---------- */
.dshp-panel .dshp-toast {
  margin: 8px 10px;
  padding: 6px 10px;
  border-radius: 7px;
  font-size: 12px;
  color: var(--dshp-success);
  background: color-mix(in srgb, var(--dshp-success) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--dshp-success) 30%, transparent);
}

/* ---------- textarea ---------- */
.dshp-panel textarea.dshp-input {
  font-family: inherit;
  font-size: 12.5px;
  padding: 6px 8px;
  border-radius: 7px;
  border: 1px solid var(--dshp-border-strong);
  background: var(--dshp-bg);
  color: var(--dshp-text);
  outline: none;
  resize: vertical;
  transition: border-color 0.12s ease, box-shadow 0.12s ease;
  width: 100%;
}
.dshp-panel textarea.dshp-input:focus {
  border-color: var(--dshp-accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--dshp-accent) 18%, transparent);
}

/* ---------- session-id input (monospace) ---------- */
.dshp-panel input.dshp-input.dshp-input-mono {
  font-family: var(--dshp-font-mono);
  font-size: 12px;
  letter-spacing: 0.01em;
}

/* ---------- inline field error / soft warning ---------- */
.dshp-panel .dshp-field-error {
  color: var(--dshp-error);
  font-size: 11.5px;
}

/* Non-blocking hint (e.g. a typed target id outside the session list). */
.dshp-panel .dshp-hint-warn {
  color: var(--dshp-warn, #b8860b);
  font-size: 11.5px;
}

/* ---------- loading state (initial snapshot pull) ---------- */
.dshp-panel .dshp-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 34px 14px;
  color: var(--dshp-text-dimmed);
  font-size: 12.5px;
}
.dshp-panel .dshp-spinner {
  width: 15px;
  height: 15px;
  flex: none;
  border-radius: 50%;
  border: 2px solid var(--dshp-border-strong);
  border-top-color: var(--dshp-accent);
  animation: dshp-spin 0.75s linear infinite;
}
@keyframes dshp-spin {
  to { transform: rotate(360deg); }
}
@media (prefers-reduced-motion: reduce) {
  .dshp-panel .dshp-spinner { animation-duration: 1.6s; }
}
`;

// src/client/panel.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
function configDraftFrom(snapshot) {
  return {
    enabled: snapshot.config.enabled,
    maxDeliveriesPerDay: String(snapshot.config.maxDeliveriesPerDay),
    quietStart: snapshot.config.quietHours.start,
    quietEnd: snapshot.config.quietHours.end,
    defaultPrompt: snapshot.config.defaultPrompt ?? "",
    silentWakeCompaction: snapshot.config.silentWakeCompaction ?? true
  };
}
function ProactivePanel(props) {
  const copy = useProactiveLocale();
  const transport = (0, import_react3.useMemo)(() => new ProactiveHostTransport(), []);
  const [snapshot, setSnapshot] = (0, import_react3.useState)(null);
  const [knownSessions, setKnownSessions] = (0, import_react3.useState)(/* @__PURE__ */ new Map());
  const [sessionCwds, setSessionCwds] = (0, import_react3.useState)(/* @__PURE__ */ new Map());
  const [error, setError] = (0, import_react3.useState)(null);
  const [busy, setBusy] = (0, import_react3.useState)(false);
  const [showForm, setShowForm] = (0, import_react3.useState)(false);
  const [editingId, setEditingId] = (0, import_react3.useState)(null);
  const [form, setForm] = (0, import_react3.useState)(() => newAlarmForm("", ""));
  const [draft, setDraft] = (0, import_react3.useState)(null);
  const [copiedId, setCopiedId] = (0, import_react3.useState)(null);
  const workspacesBound = (0, import_react3.useMemo)(() => bindSource(props.workspaces ?? EMPTY_SOURCE), [props.workspaces]);
  const workspacesSnapshot = (0, import_react3.useSyncExternalStore)(workspacesBound.subscribe, workspacesBound.getSnapshot);
  const knownWorkspaces = (0, import_react3.useMemo)(() => workspacesSnapshot.items.map((item) => ({
    id: item.workspaceId,
    title: item.title !== "" ? item.title : item.path,
    path: item.path
  })), [workspacesSnapshot]);
  (0, import_react3.useEffect)(() => {
    injectProactiveStyles();
  }, []);
  const currentSession = props.useSessions?.((state) => state.current) ?? "";
  const reload = (0, import_react3.useCallback)(async () => {
    try {
      const next = await transport.stateForHost();
      setSnapshot(next.snapshot);
      setKnownSessions(new Map(next.sessions.map((session) => [session.id, session.title])));
      setSessionCwds(new Map(next.sessions.filter((session) => session.cwd !== void 0).map((session) => [session.id, session.cwd])));
      setError(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    }
  }, [transport]);
  const refresh = (0, import_react3.useCallback)(async () => {
    try {
      const next = await transport.stateForHost();
      setSnapshot(next.snapshot);
    } catch {
    }
  }, [transport]);
  (0, import_react3.useEffect)(() => {
    void reload();
    const unsubscribe = transport.subscribe(() => {
      void reload();
    });
    return unsubscribe;
  }, [reload, transport]);
  const run = (0, import_react3.useCallback)(async (action) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const next = await transport.actionForHost(action);
      setSnapshot(next.snapshot);
      setKnownSessions(new Map(next.sessions.map((session) => [session.id, session.title])));
      setSessionCwds(new Map(next.sessions.filter((session) => session.cwd !== void 0).map((session) => [session.id, session.cwd])));
      setShowForm(false);
      setEditingId(null);
      setForm(newAlarmForm(defaultPromptOf(next.snapshot), currentSession));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
      void refresh();
    } finally {
      setBusy(false);
    }
  }, [busy, transport, refresh, currentSession]);
  const ownerForCreate = (0, import_react3.useCallback)((form_) => {
    const mode = form_.targetMode ?? "resume";
    if (mode === "new" || (form_.targetSource ?? "session") !== "session") {
      return currentSession !== "" ? currentSession : HOST_PANEL_SESSION;
    }
    return (form_.targetSessionId ?? "").trim();
  }, [currentSession]);
  const defaultWorkspaceId = (0, import_react3.useMemo)(() => {
    if (currentSession === "" || knownWorkspaces.length === 0) return void 0;
    const cwd = sessionCwds.get(currentSession);
    if (cwd === void 0) return void 0;
    return knownWorkspaces.find((workspace) => workspace.path === cwd)?.id;
  }, [currentSession, knownWorkspaces, sessionCwds]);
  const submitCreate = (0, import_react3.useCallback)(async () => {
    await run({ kind: "create", sessionId: ownerForCreate(form), args: createArgsFromForm(form) });
  }, [run, form, ownerForCreate]);
  const submitEdit = (0, import_react3.useCallback)(async () => {
    if (editingId === null) return;
    await run({ kind: "edit", id: editingId, args: createArgsFromForm(form) });
  }, [run, editingId, form]);
  const submitConfig = (0, import_react3.useCallback)(async () => {
    if (draft === null || snapshot === null) return;
    await run({
      kind: "update_config",
      patch: {
        enabled: draft.enabled,
        max_deliveries_per_day: Number(draft.maxDeliveriesPerDay),
        quiet_hours: { start: draft.quietStart, end: draft.quietEnd, time_zone: snapshot.config.quietHours.timeZone },
        // Only offered (and sent) when the host advertises the field; an
        // older host would reject the unknown key.
        ...snapshot.config.defaultPrompt !== void 0 ? { default_prompt: draft.defaultPrompt } : {},
        ...snapshot.config.silentWakeCompaction !== void 0 ? { silent_wake_compaction: draft.silentWakeCompaction } : {}
      }
    });
  }, [run, draft, snapshot]);
  const workspaceTitles = (0, import_react3.useMemo)(() => new Map(knownWorkspaces.map((workspace) => [workspace.id, workspace.title])), [knownWorkspaces]);
  const alarms = (0, import_react3.useMemo)(() => {
    const rows = snapshot?.alarms ?? [];
    if (workspaceTitles.size === 0) return rows;
    return rows.map((alarm) => alarm.targetWorkspaceId !== void 0 && (alarm.targetWorkspaceTitle === void 0 || alarm.targetWorkspaceTitle === "") ? { ...alarm, targetWorkspaceTitle: workspaceTitles.get(alarm.targetWorkspaceId) ?? "" } : alarm);
  }, [snapshot, workspaceTitles]);
  const loading = snapshot === null && error === null;
  const openCreate = (0, import_react3.useCallback)(() => {
    setEditingId(null);
    setForm(newAlarmForm(defaultPromptOf(snapshot), currentSession));
    setShowForm(true);
  }, [snapshot, currentSession]);
  const openEdit = (0, import_react3.useCallback)((id) => {
    const alarm = snapshot?.alarms.find((a) => a.id === id);
    if (alarm === void 0) return;
    setEditingId(id);
    setForm(formFromAlarm(alarm));
    setShowForm(true);
  }, [snapshot]);
  const copyId = (0, import_react3.useCallback)(async (sessionId) => {
    try {
      await navigator.clipboard.writeText(sessionId);
      setCopiedId(sessionId);
      setTimeout(() => setCopiedId(null), 1200);
    } catch {
      setError(copy.error);
    }
  }, [copy]);
  const runsByAlarm = (0, import_react3.useMemo)(() => {
    const map = /* @__PURE__ */ new Map();
    for (const run2 of snapshot?.runs ?? []) {
      const bucket = map.get(run2.alarmId) ?? [];
      bucket.push(run2);
      map.set(run2.alarmId, bucket);
    }
    return map;
  }, [snapshot]);
  const sync = snapshot?.server.sync;
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dshp-panel", "data-testid": "proactive-panel", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dshp-head", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h2", { className: "dshp-title", children: copy.globalTitle }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "dshp-sub", children: loading ? copy.loading : copy.globalView + " \xB7 " + alarms.length + " " + copy.alarms })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dshp-btn-row", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { className: "dshp-btn", onClick: () => {
          void reload();
        }, disabled: busy || loading, children: copy.refresh }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { className: "dshp-btn dshp-btn-primary", onClick: openCreate, disabled: snapshot === null, children: copy.newAlarm })
      ] })
    ] }),
    error !== null && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dshp-error", children: [
      copy.error,
      ": ",
      error
    ] }),
    loading ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "dshp-card", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(LoadingBlock, { copy }) }) : snapshot !== null ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dshp-card", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dshp-card-head", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: copy.configSectionTitle }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dshp-cell-dim", children: copy.configSectionDesc })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dshp-card-body", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dshp-switch-row", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "dshp-switch-label", children: copy.enabledToggle }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dshp-switch-desc", children: [
              copy.budget,
              ": ",
              snapshot.config.maxDeliveriesPerDay,
              copy.perDay,
              " \xB7 ",
              copy.quietHours,
              ": ",
              snapshot.config.quietHours.start,
              "-",
              snapshot.config.quietHours.end
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("label", { className: "dshp-switch", children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
              "input",
              {
                type: "checkbox",
                checked: (draft ?? configDraftFrom(snapshot)).enabled,
                disabled: busy,
                onChange: (e) => setDraft({ ...draft ?? configDraftFrom(snapshot), enabled: e.target.checked })
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dshp-switch-track" }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dshp-switch-thumb" })
          ] })
        ] }),
        snapshot.config.silentWakeCompaction !== void 0 ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dshp-switch-row", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "dshp-switch-label", children: copy.silentWakeCompactionToggle }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "dshp-switch-desc", children: copy.silentWakeCompactionHint })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("label", { className: "dshp-switch", children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
              "input",
              {
                type: "checkbox",
                checked: (draft ?? configDraftFrom(snapshot)).silentWakeCompaction,
                disabled: busy,
                onChange: (e) => setDraft({ ...draft ?? configDraftFrom(snapshot), silentWakeCompaction: e.target.checked })
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dshp-switch-track" }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dshp-switch-thumb" })
          ] })
        ] }) : null,
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dshp-field-row", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dshp-field", style: { flex: 1, minWidth: 120 }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("label", { className: "dshp-field-label", children: copy.budget }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
              "input",
              {
                className: "dshp-input",
                type: "number",
                min: 0,
                max: 50,
                value: (draft ?? configDraftFrom(snapshot)).maxDeliveriesPerDay,
                disabled: busy,
                onChange: (e) => setDraft({ ...draft ?? configDraftFrom(snapshot), maxDeliveriesPerDay: e.target.value })
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dshp-field", style: { flex: 1, minWidth: 100 }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("label", { className: "dshp-field-label", children: copy.quietHoursStart }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
              "input",
              {
                className: "dshp-input",
                type: "time",
                value: (draft ?? configDraftFrom(snapshot)).quietStart,
                disabled: busy,
                onChange: (e) => setDraft({ ...draft ?? configDraftFrom(snapshot), quietStart: e.target.value })
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dshp-field", style: { flex: 1, minWidth: 100 }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("label", { className: "dshp-field-label", children: copy.quietHoursEnd }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
              "input",
              {
                className: "dshp-input",
                type: "time",
                value: (draft ?? configDraftFrom(snapshot)).quietEnd,
                disabled: busy,
                onChange: (e) => setDraft({ ...draft ?? configDraftFrom(snapshot), quietEnd: e.target.value })
              }
            )
          ] })
        ] }),
        snapshot.config.defaultPrompt !== void 0 ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dshp-field", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("label", { className: "dshp-field-label", children: copy.defaultPromptLabel }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            "textarea",
            {
              className: "dshp-input dshp-grow",
              rows: 3,
              maxLength: MAX_PROMPT_LENGTH,
              value: (draft ?? configDraftFrom(snapshot)).defaultPrompt,
              disabled: busy,
              placeholder: defaultPromptOf(null),
              onChange: (e) => setDraft({ ...draft ?? configDraftFrom(snapshot), defaultPrompt: e.target.value })
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "dshp-cell-dim", children: copy.defaultPromptHint })
        ] }) : null,
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "dshp-btn-row", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { className: "dshp-btn dshp-btn-primary", disabled: busy, onClick: () => {
          void submitConfig();
        }, children: copy.saveConfig }) })
      ] })
    ] }) : null,
    showForm ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      CreateForm,
      {
        form,
        setForm,
        showForm,
        setShowForm,
        busy,
        copy,
        editing: editingId !== null,
        knownSessions,
        knownWorkspaces,
        knownPresets: snapshot?.presets,
        defaultWorkspaceId,
        onSubmit: () => {
          void (editingId !== null ? submitEdit() : submitCreate());
        }
      }
    ) : null,
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dshp-card", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dshp-card-head", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: copy.alarmsTitle }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: "dshp-cell-dim", title: sync !== void 0 && sync.errors.length > 0 ? sync.errors.join("\n") : void 0, children: [
          snapshot?.server.corrupt === true ? copy.storageCorrupt : "",
          snapshot?.server.corrupt === true && sync !== void 0 ? " \xB7 " : "",
          sync !== void 0 ? copy.syncLast + ": h" + sync.handles + " +" + sync.created + " ~" + sync.updated + " -" + sync.removed + " err" + sync.errors.length : ""
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dshp-card-body", style: { padding: 0 }, children: [
        loading ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(LoadingBlock, { copy }) : /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          AlarmTable,
          {
            alarms,
            runsByAlarm,
            showSession: true,
            busy,
            copy,
            onToggle: (id) => {
              void run({ kind: "toggle", id });
            },
            onCancel: (id) => {
              if (confirm(copy.confirmCancel)) void run({ kind: "cancel", id });
            },
            onFire: (id) => {
              void run({ kind: "fire", id });
            },
            onEdit: (id) => openEdit(id),
            onCopyId: (sessionId) => {
              void copyId(sessionId);
            }
          }
        ),
        copiedId !== null ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dshp-toast", children: [
          copy.copied,
          ": ",
          copiedId === HOST_PANEL_SESSION ? fmtSession(copiedId, void 0, copy) : copiedId
        ] }) : null
      ] })
    ] })
  ] });
}

// src/client/index.ts
var inject = ["slots", "remote", "connection", "locale"];
var NS = "dsh-proactive";
function apply(ctx) {
  injectProactiveStyles();
  const locale = ctx.locale;
  try {
    ctx.effect(() => locale.register(NS, { zh, en }), "dsh-proactive: dictionaries");
    bindProactiveLocale(locale);
  } catch (error) {
    console.error("[dsh-proactive] locale bind failed (falling back to zh)", error);
  }
  const t = locale.bind(NS);
  const injectWorkspaces = () => {
    try {
      const service = ctx.get("workspaces", false);
      return service?.list === void 0 ? {} : { workspaces: service.list };
    } catch {
      return {};
    }
  };
  let anyApplied = false;
  try {
    ctx.slots.inject(
      "settings.section",
      () => ctx.slots.register(
        {
          name: "settings.section",
          id: "dsh-proactive",
          order: 120,
          locale: NS,
          label: () => t("tabLabel"),
          inject: injectWorkspaces
        },
        ProactivePanel
      )
    );
    anyApplied = true;
  } catch (error) {
    console.error("[dsh-proactive] settings.section registration failed", error);
  }
  if (anyApplied) console.info("[dsh-proactive] panel surfaces mounted (settings.section + conversation.view)");
}

		return module.exports;
	}
});