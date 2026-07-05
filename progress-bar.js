// progress-bar.js — 顶部进度条
export function createProgressBar() {
  const bar = document.getElementById('progress-bar')
  const fill = document.getElementById('progress-fill')
  const currentEl = document.getElementById('time-current')
  const totalEl = document.getElementById('time-total')

  let isDragging = false
  let onSeekCallback = null
  let duration = 0

  function formatTime(sec) {
    if (!sec || !isFinite(sec)) return '0:00'
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60)
    return m + ':' + (s < 10 ? '0' : '') + s
  }

  function update(current, dur) {
    if (dur && isFinite(dur)) duration = dur
    const pct = duration > 0 ? (current / duration) * 100 : 0
    if (!isDragging) {
      fill.style.width = Math.min(pct, 100) + '%'
    }
    currentEl.textContent = formatTime(current)
    totalEl.textContent = formatTime(duration)
  }

  bar.addEventListener('mousedown', (e) => {
    if (!duration) return
    isDragging = true
    const rect = bar.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    fill.style.width = (pct * 100) + '%'
  })

  document.addEventListener('mousemove', (e) => {
    if (!isDragging || !duration) return
    const rect = bar.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    fill.style.width = (pct * 100) + '%'
  })

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false
      const w = parseFloat(fill.style.width) || 0
      const time = (w / 100) * duration
      if (onSeekCallback) onSeekCallback(time)
    }
  })

  function onSeek(cb) { onSeekCallback = cb }

  function setDuration(dur) {
    if (dur && isFinite(dur)) duration = dur
  }

  return { update, onSeek, setDuration }
}
