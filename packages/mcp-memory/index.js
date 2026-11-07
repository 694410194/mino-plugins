// @modelcontextprotocol/server-memory：纯配置 bundle 的标记行。实际能力由同 patch 插入的官方
// dsh-mcp-client 行提供；本模块仅给 bundle 一个与包同名的稳定插件身份
//（verify-all 要求 patch 含包名行），不注册任何贡献。
export const name = '@modelcontextprotocol/server-memory'

export function apply() {}
