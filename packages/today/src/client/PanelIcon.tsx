/** 侧栏「今日」图标：太阳从地平线升起的罗盘式字形，壳层给尺寸和选中态。 */
export function PanelIcon({ size }: { size: number; active: boolean }) {
  return (
    <svg
      data-dsh-panel-entry="today"
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
      <circle cx="8" cy="9" r="3.2" />
      <path d="M8 2.4v1.6" />
      <path d="M3.4 5.1l1.1 1.1" />
      <path d="M12.6 5.1l-1.1 1.1" />
      <path d="M2 12.8h12" />
      <path d="M4.4 14.6h7.2" />
    </svg>
  )
}
