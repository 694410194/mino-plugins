/**
 * The `brief` storage domain: singleton state rows (session id, schedule ids,
 * user-deletion tombstones). Names must match `[a-z][a-z0-9_]*`.
 */
import { defineDomain, domainTable } from '@deepseek-ai/dsh-storage-domain'
import { z } from 'zod'

/** Small singleton row: `schedule:morning` → schedule id, `gone:morning` → '1'. */
export const StateRow = z.object({
  key: z.string(),
  value: z.string(),
})
export type StateRow = z.infer<typeof StateRow>

export const briefDomain = defineDomain({
  name: 'brief',
  version: 1,
  tables: {
    state: domainTable<string, StateRow>(StateRow),
  },
})
