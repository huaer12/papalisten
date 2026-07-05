// lyrics-display.js — 歌词三级策略系统

const LRCLIB_API = 'https://lrclib.net/api'

export function createLyricsDisplay() {
  const scroll = document.getElementById('lyrics-scroll')
  let lineEls = []
  let lastMatchedArtist = ''

  function getMatchedArtist() { return lastMatchedArtist }

  function loadLines(lyricsData) {
    scroll.innerHTML = ''
    lineEls = []
    for (const l of lyricsData) {
      const p = document.createElement('p')
      p.className = 'lyrics-line'
      p.textContent = l.text
      scroll.appendChild(p)
      lineEls.push(p)
    }
  }

  function clear() {
    scroll.innerHTML = ''
    lineEls = []
  }

  function scrollTo(index) {
    if (!lineEls.length || index < 0) return
    const containerHeight = scroll.parentElement.clientHeight
    let offset = 0
    for (let i = 0; i < index; i++) {
      offset += lineEls[i].offsetHeight
    }
    const currentH = lineEls[index].offsetHeight
    offset = offset + currentH / 2 - containerHeight / 2
    const maxOffset = Math.max(0, scroll.scrollHeight - containerHeight)
    offset = Math.max(0, Math.min(offset, maxOffset))
    scroll.style.transform = `translateY(-${offset}px)`
    lineEls.forEach((el, i) => {
      el.classList.toggle('active', i === index)
    })
  }

  // 内置演示歌词（带时间轴，单位：秒）
  const DEMO_LYRICS = [
    { time: 0, text: "We don't talk anymore" },
    { time: 3.5, text: "We don't talk anymore" },
    { time: 7, text: "We don't talk anymore" },
    { time: 10.5, text: 'Like we used to do' },
    { time: 14, text: "We don't love anymore" },
    { time: 17.5, text: 'What was all of it for' },
    { time: 21, text: "Oh, we don't talk anymore" },
    { time: 24.5, text: 'Like we used to do' },
    { time: 28, text: 'I just heard you found the one' },
    { time: 31.5, text: "You've been looking for" },
    { time: 35, text: "I wish I would have known that wasn't me" },
    { time: 38.5, text: 'And even after all this time' },
    { time: 42, text: "I still wish you'd be mine" },
  ]

  function getDemoLyrics() { return DEMO_LYRICS }

  // 从 LRCLIB 搜索歌词
  async function fetchLyrics(query) {
    try {
      const res = await fetch(`${LRCLIB_API}/search?q=${encodeURIComponent(query)}`)
      if (!res.ok) return null
      const results = await res.json()
      if (!results || results.length === 0) return null
      return results.filter(r => !r.instrumental).length > 0
        ? results.filter(r => !r.instrumental)
        : results
    } catch {
      return null
    }
  }

  function pickBestMatch(candidates, actualDuration) {
    if (!candidates || candidates.length === 0) return null
    if (candidates.length === 1) return candidates[0]
    const withDiff = candidates.map(c => ({
      ...c,
      diff: c.duration ? Math.abs(c.duration - actualDuration) : Infinity
    }))
    withDiff.sort((a, b) => a.diff - b.diff)
    return withDiff[0]
  }

  function scaleTimestamps(entries, lrcDuration, actualDuration) {
    if (!lrcDuration || !actualDuration || lrcDuration <= 0 || actualDuration <= 0) return entries
    const ratio = actualDuration / lrcDuration
    if (Math.abs(ratio - 1) < 0.05) return entries
    return entries.map(e => ({ ...e, time: e.time * ratio }))
  }

  function parseLRC(lrcText) {
    const lines = lrcText.split('\n')
    const result = []
    for (const line of lines) {
      const match = line.match(/\[(\d{1,3}):(\d{2})[\.:](\d{2,3})\](.*)/)
      if (match) {
        const minutes = parseInt(match[1])
        const seconds = parseInt(match[2])
        let millis = parseInt(match[3])
        if (millis > 1000) millis = Math.round(millis / 10)
        const time = minutes * 60 + seconds + millis / 1000
        const text = match[4].trim()
        if (text) result.push({ time, text })
      }
    }
    return result.length > 0 ? result : null
  }

  function estimateTiming(lyricsText, duration) {
    const lines = lyricsText.split('\n').filter(l => l.trim())
    if (lines.length === 0) return null
    if (lines.length > 50) lines.splice(30)
    const interval = duration / (lines.length + 1)
    return lines.map((text, i) => ({
      time: (i + 1) * interval,
      text: text.trim()
    }))
  }

  async function loadForTrack(artist, title, duration) {
    lastMatchedArtist = ''
    // 优先用 "歌手 歌名" 搜索，如果 artist 为空就用纯歌名
    const query = [artist, title].filter(Boolean).join(' ')
    let candidates = await fetchLyrics(query)

    // 如果只搜歌名没结果，且之前有 artist 信息，再用纯歌名试一次
    if (!candidates && !artist) {
      candidates = await fetchLyrics(title)
    }

    if (candidates) {
      const match = pickBestMatch(candidates, duration)
      if (match) {
        lastMatchedArtist = match.artistName
        if (match.syncedLyrics) {
          let parsed = parseLRC(match.syncedLyrics)
          if (parsed) {
            parsed = scaleTimestamps(parsed, match.duration, duration)
            return parsed
          }
        }
        if (match.plainLyrics) {
          const timed = estimateTiming(match.plainLyrics, duration)
          if (timed) return timed
        }
      }
    }

    // 兜底：用歌曲名显示
    const displayText = [artist || lastMatchedArtist, title].filter(Boolean).join(' — ')
    if (displayText) {
      return [{ time: 0, text: displayText }]
    }
    return null
  }

  return { loadLines, clear, scrollTo, getDemoLyrics, loadForTrack, getMatchedArtist, estimateTiming }
}

let lastActiveIdx = -1
export function updateLyricsDisplay(lyricsData, currentTime, display) {
  if (!lyricsData || lyricsData.length === 0) {
    display.clear()
    return
  }

  let activeIdx = -1
  for (let i = 0; i < lyricsData.length; i++) {
    if (currentTime >= lyricsData[i].time) {
      activeIdx = i
    } else {
      break
    }
  }

  if (activeIdx === lastActiveIdx) return
  lastActiveIdx = activeIdx

  display.scrollTo(activeIdx)
}
