/** 侧栏「语音笔记」图标：麦克风立架，壳层给尺寸和选中态。 */
export function PanelIcon({ size }: { size: number; active: boolean }) {
  return (
    <svg
      data-dsh-panel-entry="vnotes"
      viewBox="0 0 16 16"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="6" y="1.6" width="4" height="7.4" rx="2" />
      <path d="M3.8 7.6a4.2 4.2 0 0 0 8.4 0" />
      <path d="M8 11.8v2.6" />
      <path d="M5.4 14.6h5.2" />
    </svg>
  )
}
