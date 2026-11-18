/** meeting-detect storage domain: singleton state rows + reminded-event tombstones. */
import { defineDomain, domainTable } from '@deepseek-ai/dsh-storage-domain'
import { z } from 'zod'

export const StateRow = z.object({
  key: z.string(),
  value: z.string(),
})
export type StateRow = z.infer<typeof StateRow>

export const meetingDomain = defineDomain({
  name: 'meeting_detect',
  version: 1,
  tables: {
    state: domainTable<string, StateRow>(StateRow),
  },
})
