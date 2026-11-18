# mino-cred-vault

凭据引导薄层——把官方 `credentials` 服务缝（`dsh-credentials-local`，
`$DSH_HOME/.credentials.yaml` + 环境/`.env` 回退层）露成三个会话内模型工具：

| 工具 | 作用 | 门闸 |
|---|---|---|
| `cred_status` | 查引用配置态（configured/source/writable/masked）+ 枚举插件记录（key+kind） | 无 |
| `cred_set` | 按环境变量名写入密钥（如用户贴 `DEEPSEEK_API_KEY=xxx`） | 官方审批缝 ask |
| `cred_unset` | 删除引用（空操作安全） | 官方审批缝 ask |

## 安全边界

- **没有取值工具**——`resolve` 不暴露给模型，密钥永远不被念回会话；
  状态面只回 `describe` 的官方遮蔽预览。
- record 半（`scope/id` 插件自有记录）只读枚举；写 record 是属主插件的事。
- 凭据库本体由官方 `credentials-local` 持有——本插件零自有存储、零凭据副本。

## 依赖

宿主需挂载 `credentials` 服务（`dsh-credentials-local` 在 bundle 栈里）。
未挂载时工具如实回报 `seam: absent`，不装死。
