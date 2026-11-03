export function nextRoundRobinMember(members, completedMemberId) {
    const live = members.filter((m) => m.enabled && m.removedAt === undefined);
    const i = live.findIndex((m) => m.id === completedMemberId);
    return live[(i + 1) % live.length]?.id;
}
//# sourceMappingURL=round-robin.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
