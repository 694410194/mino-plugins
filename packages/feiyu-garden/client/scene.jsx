// 海蒂花园的海洋场景 —— 四个时辰境：浅海晨光 / 暮色 / 星海 / 深渊。
// 全部 SVG + CSS 动画，零外部资源。
import React from 'react'

export function resolveScene(scene) {
  if (scene && scene !== 'auto') return scene
  const h = new Date().getHours()
  if (h >= 5 && h < 11) return 'dawn'
  if (h >= 11 && h < 17) return 'dawn'
  if (h >= 17 && h < 20) return 'dusk'
  return 'night'
}

export const SCENES = [
  { id: 'auto', zh: '跟随时间' },
  { id: 'dawn', zh: '浅海' },
  { id: 'dusk', zh: '暮色' },
  { id: 'night', zh: '星海' },
  { id: 'abyss', zh: '深渊' },
]

/** 粒子的确定性伪随机（种子化，重渲染不闪） */
function rand(seed) {
  let s = seed >>> 0
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296)
}

function Particles({ kind, count = 18, seed = 7 }) {
  const r = React.useMemo(() => {
    const rnd = rand(seed)
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: rnd() * 100,
      y: rnd() * 100,
      size: 1.5 + rnd() * 4,
      delay: -rnd() * 24,
      dur: 12 + rnd() * 18,
      drift: (rnd() - 0.5) * 40,
      o: 0.25 + rnd() * 0.55,
    }))
  }, [count, seed])
  return (
    <div className={`fg-particles fg-particles-${kind}`} aria-hidden="true">
      {r.map(p => (
        <i key={p.id} style={{
          left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size,
          opacity: p.o, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s`,
          '--fg-drift': `${p.drift}px`,
        }} />
      ))}
    </div>
  )
}

function Bubbles({ count = 10, seed = 21 }) {
  const r = React.useMemo(() => {
    const rnd = rand(seed)
    return Array.from({ length: count }, (_, i) => ({
      id: i, x: 8 + rnd() * 84, size: 4 + rnd() * 10,
      delay: -rnd() * 16, dur: 7 + rnd() * 9, drift: (rnd() - 0.5) * 30,
    }))
  }, [count, seed])
  return (
    <div className="fg-bubbles" aria-hidden="true">
      {r.map(b => (
        <i key={b.id} style={{
          left: `${b.x}%`, width: b.size, height: b.size,
          animationDelay: `${b.delay}s`, animationDuration: `${b.dur}s`,
          '--fg-drift': `${b.drift}px`,
        }} />
      ))}
    </div>
  )
}

/** 海草/珊瑚剪影簇 */
function Plants({ scene }) {
  return (
    <svg className="fg-plants" viewBox="0 0 1200 220" preserveAspectRatio="none" aria-hidden="true">
      <g className="fg-plant fg-plant-a">
        <path d="M60 220 C50 170 70 140 58 96 C76 138 66 170 78 220 Z" />
        <path d="M92 220 C88 180 102 150 96 118 C112 152 102 186 110 220 Z" />
      </g>
      <g className="fg-plant fg-plant-b">
        <path d="M1060 220 C1052 168 1074 132 1062 84 C1082 128 1072 168 1084 220 Z" />
        <path d="M1104 220 C1098 186 1112 158 1106 130 C1120 162 1112 190 1118 220 Z" />
        <path d="M1032 220 C1030 196 1040 178 1036 160 C1048 180 1042 200 1046 220 Z" />
      </g>
      {scene === 'dawn' && (
        <g className="fg-coral">
          <path d="M180 220 C176 200 168 192 170 178 C182 188 182 200 186 210 C190 196 200 190 198 176 C208 190 200 208 204 220 Z" />
          <circle cx="186" cy="200" r="5" />
        </g>
      )}
      {scene === 'abyss' && (
        <g className="fg-glowplants">
          <ellipse cx="1120" cy="196" rx="8" ry="14" />
          <ellipse cx="1140" cy="204" rx="6" ry="10" />
          <ellipse cx="80" cy="206" rx="7" ry="11" />
        </g>
      )}
    </svg>
  )
}

export function Ocean({ scene }) {
  return (
    <div className={`fg-ocean fg-scene-${scene}`} aria-hidden="true">
      {/* 天光/光源 */}
      <div className="fg-light">
        {scene === 'dawn' && <div className="fg-sun" />}
        {scene === 'dusk' && <div className="fg-sun fg-sun-dusk" />}
        {scene === 'night' && <div className="fg-moon" />}
        {scene !== 'abyss' && (
          <div className="fg-rays">
            <i /><i /><i />
          </div>
        )}
        {scene === 'night' && <Particles kind="stars" count={46} seed={11} />}
        {scene === 'abyss' && <Particles kind="abyss" count={30} seed={13} />}
      </div>
      {/* 上浮颗粒与气泡 */}
      <Particles kind={scene === 'night' || scene === 'abyss' ? 'glow' : 'motes'} count={scene === 'abyss' ? 8 : 16} seed={scene === 'abyss' ? 29 : 17} />
      <Bubbles count={scene === 'abyss' ? 5 : 10} />
      {/* 深渊水母 */}
      {scene === 'abyss' && (
        <div className="fg-jellies">
          {[0, 1].map(i => (
            <svg key={i} className={`fg-jelly fg-jelly-${i}`} viewBox="0 0 60 90" aria-hidden="true">
              <path d="M8 34 C8 12 52 12 52 34 C52 42 44 46 30 46 C16 46 8 42 8 34 Z" fill="rgba(140,220,255,.35)" stroke="rgba(180,235,255,.7)" strokeWidth="1.5" />
              <path d="M16 46 C14 60 20 66 16 78 M26 46 C24 62 30 68 26 82 M36 46 C38 60 32 66 36 78 M44 46 C46 58 42 64 44 74" stroke="rgba(170,225,255,.55)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
            </svg>
          ))}
        </div>
      )}
      {/* 海底 */}
      <div className="fg-floor" />
      <Plants scene={scene} />
    </div>
  )
}
