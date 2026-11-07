// 海蒂花园的鲸鱼本体 —— 纯 SVG 手绘，表情随心情参数化。
import React from 'react'

/**
 * @param mood 0-100：决定眼睛形状、嘴角弧度、腮红可见度
 * @param burst 'feed'|'pet'|null：动作后的情绪爆发（气泡心/水花）
 * @param scene 场景名，微调体色
 */
export function Whale({ mood = 70, burst = null, scene = 'dawn', flipped = false }) {
  const happy = mood >= 65
  const sad = mood < 25
  const sleepy = !happy && !sad
  // 嘴角：-1(撇) ~ +1(翘)
  const mouth = (mood - 50) / 50
  const blush = Math.max(0, (mood - 55) / 45)
  const body = scene === 'abyss' || scene === 'night'
    ? { main: 'url(#fg-whale-body-night)', belly: '#9fc6de' }
    : { main: 'url(#fg-whale-body)', belly: '#eef7fb' }

  return (
    <svg className={`fg-whale ${flipped ? 'is-flip' : ''}`} viewBox="0 0 340 220" aria-hidden="true">
      <defs>
        <linearGradient id="fg-whale-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8ec6e2" />
          <stop offset="55%" stopColor="#6ba9cf" />
          <stop offset="100%" stopColor="#4f8cb8" />
        </linearGradient>
        <linearGradient id="fg-whale-body-night" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5b7f9e" />
          <stop offset="55%" stopColor="#42648a" />
          <stop offset="100%" stopColor="#2f4a6c" />
        </linearGradient>
        <radialGradient id="fg-whale-glow" cx="50%" cy="42%" r="60%">
          <stop offset="0%" stopColor="rgba(255,255,255,.55)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>

      {/* 身体光晕 */}
      <ellipse className="fg-whale-aura" cx="170" cy="118" rx="150" ry="92" fill="url(#fg-whale-glow)" />

      <g className="fg-whale-float">
        {/* 尾鳍 —— 独立摆 */}
        <g className="fg-whale-tail" style={{ transformOrigin: '66px 118px' }}>
          <path d="M66 118 C40 96 22 94 12 104 C26 110 30 118 30 118 C30 118 26 126 12 132 C22 142 40 140 66 118 Z" fill={body.main} />
        </g>

        {/* 身体 */}
        <path d="M64 118 C64 76 110 44 172 44 C240 44 296 76 296 118 C296 156 244 178 178 178 C118 178 64 158 64 118 Z" fill={body.main} />
        {/* 肚皮 */}
        <path d="M84 140 C110 162 150 172 184 172 C226 172 264 156 284 132 C272 158 226 178 178 178 C126 178 92 162 84 140 Z" fill={body.belly} opacity=".92" />
        {/* 背鳍 */}
        <path d="M176 46 C188 30 208 28 214 38 C204 42 196 50 192 58 Z" fill={body.main} />
        {/* 胸鳍 —— 另一侧摆 */}
        <g className="fg-whale-fin" style={{ transformOrigin: '236px 138px' }}>
          <path d="M238 136 C258 142 266 158 262 170 C246 168 234 156 230 142 Z" fill={body.main} />
        </g>

        {/* 表情 */}
        {happy ? (
          <>
            {/* 眯眯笑眼 ^ ^ */}
            <path className="fg-whale-eye" d="M242 102 Q250 92 258 102" fill="none" stroke="#1d3140" strokeWidth="5" strokeLinecap="round" />
            <path className="fg-whale-eye" d="M272 102 Q280 92 288 102" fill="none" stroke="#1d3140" strokeWidth="5" strokeLinecap="round" />
          </>
        ) : sleepy ? (
          <>
            <circle className="fg-whale-eye" cx="250" cy="102" r="6.5" fill="#1d3140" />
            <circle cx="252.5" cy="100" r="2" fill="#fff" />
            <circle className="fg-whale-eye" cx="280" cy="102" r="6.5" fill="#1d3140" />
            <circle cx="282.5" cy="100" r="2" fill="#fff" />
          </>
        ) : (
          <>
            {/* 委屈：下垂眼 */}
            <ellipse className="fg-whale-eye" cx="250" cy="106" rx="6" ry="7" fill="#1d3140" />
            <ellipse className="fg-whale-eye" cx="280" cy="106" rx="6" ry="7" fill="#1d3140" />
            <path d="M244 94 Q250 90 256 93" stroke="#1d3140" strokeWidth="3" fill="none" strokeLinecap="round" opacity=".7" />
            <path d="M274 93 Q280 90 286 94" stroke="#1d3140" strokeWidth="3" fill="none" strokeLinecap="round" opacity=".7" />
          </>
        )}
        {/* 嘴 */}
        <path d={`M258 122 Q268 ${122 + mouth * 9} 278 122`} fill="none" stroke="#1d3140" strokeWidth="4" strokeLinecap="round" />
        {/* 腮红 */}
        <ellipse cx="238" cy="118" rx="10" ry="6" fill="#ff9db0" opacity={0.15 + blush * 0.55} />
        <ellipse cx="292" cy="118" rx="10" ry="6" fill="#ff9db0" opacity={0.15 + blush * 0.55} />
      </g>

      {/* 情绪爆发层 */}
      {burst === 'pet' && (
        <g className="fg-burst">
          {[0, 1, 2].map(i => (
            <path key={i} className={`fg-heart fg-heart-${i}`}
              d="M0 4 C-4 -2 -12 1 -8 7 L0 12 L8 7 C12 1 4 -2 0 4 Z"
              transform={`translate(${240 + i * 30}, ${58 - i * 8})`} fill="#ff7d95" />
          ))}
        </g>
      )}
      {burst === 'feed' && (
        <g className="fg-burst">
          {[0, 1, 2, 3].map(i => (
            <circle key={i} className={`fg-token fg-token-${i}`} cx={210 + i * 26} cy={40 + (i % 2) * 10} r="6" fill="#ffd77a" stroke="#e8a93c" strokeWidth="1.5" />
          ))}
        </g>
      )}
    </svg>
  )
}
