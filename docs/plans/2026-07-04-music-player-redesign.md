# 自然风格音乐播放器 UI 复刻实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将现有 3D 频谱可视化项目重构为视频风格音乐播放器，精确复刻参考视频中的 UI 样式

**Architecture:** 纯 2D UI 架构，Vite + 原生 JS，background video 全屏铺底，控制栏毛玻璃悬浮，歌词模块叠加在上层。移除所有 Three.js 依赖。

**Tech Stack:** Vite, vanilla JS, CSS Glassmorphism, Web Audio API, jsmediatags, lyrics.ovh API

---

### Task 0: 清理项目，移除 3D 相关文件

**Files:**
- Delete: `three/`（整个目录）
- Delete: `ui/controls.js`
- Modify: `main.js`（删掉原有 3D 导入和动画循环）
- Install: `jsmediatags`

- [ ] **Step 1: 清理文件结构**

```bash
rm -rf "D:/本地浏览器下载/动画skill/music-visualizer/three"
rm -f "D:/本地浏览器下载/动画skill/music-visualizer/ui/controls.js"
```

- [ ] **Step 2: 安装 jsmediatags**

```bash
cd "D:/本地浏览器下载/动画skill/music-visualizer"
npm install jsmediatags
```

- [ ] **Step 3: 清空 main.js，保留基础骨架**

```js
// main.js — 重构：自然风格音乐播放器
```

---

### Task 1: 重写 index.html — 精简 DOM 结构

**Files:**
- Modify: `index.html`

- [ ] **Step 1: 写入新 index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>音乐播放器</title>
  <link rel="stylesheet" href="/style.css" />
</head>
<body>
  <div id="app">
    <video id="bg-video" muted loop playsinline></video>
    <div id="overlay"></div>
    <div id="lyrics-container">
      <p id="lyrics-line-1" class="lyrics-line prev"></p>
      <p id="lyrics-line-2" class="lyrics-line current"></p>
      <p id="lyrics-line-3" class="lyrics-line next"></p>
    </div>
    <div id="progress-bar">
      <div id="progress-fill"></div>
      <div id="progress-thumb"></div>
      <span id="time-current">0:00</span>
      <span id="time-total">0:00</span>
    </div>
    <div id="controls-bar">
      <div id="cover-section">
        <img id="cover-thumb" src="/favicon.svg" alt="cover" />
        <div id="track-info">
          <span id="track-title">未选择曲目</span>
          <span id="track-artist">-</span>
        </div>
      </div>
      <div id="controls-group">
        <button id="btn-like" class="ctrl-btn">♡</button>
        <button id="btn-add" class="ctrl-btn">⊕</button>
        <button id="btn-repeat" class="ctrl-btn">🔁</button>
        <button id="btn-prev" class="ctrl-btn">⏮</button>
        <button id="btn-play" class="ctrl-btn play-btn">▶</button>
        <button id="btn-next" class="ctrl-btn">⏭</button>
        <button id="btn-menu" class="ctrl-btn">⋮</button>
        <button id="btn-lyrics" class="ctrl-btn">词</button>
        <button id="btn-volume" class="ctrl-btn">🔊</button>
        <button id="btn-fullscreen" class="ctrl-btn">⛶</button>
      </div>
      <input type="file" id="file-input" accept="audio/*" hidden />
    </div>
  </div>
  <script type="module" src="/main.js"></script>
</body>
</html>
```

---

### Task 2: 重写 style.css — 毛玻璃风格

**Files:**
- Modify: `style.css`

- [ ] **Step 1: 写入完整样式**

```css
/* style.css — 完整的毛玻璃风格播放器样式 */
* { margin: 0; padding: 0; box-sizing: border-box; }

html, body {
  width: 100%; height: 100%;
  overflow: hidden;
  background: #0a0a0f;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  color: #fff;
  user-select: none;
}

#app {
  width: 100%; height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

/* === 背景视频 === */
#bg-video {
  position: fixed;
  inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  z-index: 0;
}

#overlay {
  position: fixed;
  inset: 0;
  z-index: 1;
  background: rgba(0,0,0,0.25);
}

/* === 歌词区域 === */
#lyrics-container {
  position: relative;
  z-index: 2;
  text-align: center;
  max-width: 80vw;
  padding-bottom: 120px;
}

.lyrics-line {
  font-weight: 700;
  color: #fff;
  text-shadow: 0 0 40px rgba(0,0,0,0.6);
  transition: all 0.8s ease;
  margin: 8px 0;
}

.lyrics-line.current {
  font-size: clamp(28px, 4.5vw, 52px);
  opacity: 1;
}

.lyrics-line.prev, .lyrics-line.next {
  font-size: clamp(18px, 2.5vw, 30px);
  opacity: 0.35;
}

.lyrics-line.prev { transform: translateY(-10px); }
.lyrics-line.next { transform: translateY(10px); }

/* === 进度条区域 === */
#progress-bar {
  position: fixed;
  bottom: 96px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  width: min(640px, 90vw);
  height: 4px;
  background: rgba(255,255,255,0.15);
  border-radius: 2px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

#progress-fill {
  height: 100%;
  background: #fff;
  border-radius: 2px;
  width: 0%;
  transition: width 0.1s linear;
  position: relative;
}

#progress-thumb {
  position: absolute;
  right: -6px;
  top: 50%;
  transform: translateY(-50%);
  width: 12px; height: 12px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 8px rgba(255,255,255,0.4);
  opacity: 0;
  transition: opacity 0.2s;
}

#progress-bar:hover #progress-thumb { opacity: 1; }

#time-current, #time-total {
  position: fixed;
  bottom: 90px;
  font-size: 11px;
  color: rgba(255,255,255,0.6);
  font-variant-numeric: tabular-nums;
  z-index: 10;
}

#time-current { right: calc(50% + min(320px, 45vw) + 12px); }
#time-total { left: calc(50% + min(320px, 45vw) + 12px); }

/* === 控制栏 === */
#controls-bar {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  width: min(640px, 90vw);
  background: rgba(30,30,35,0.78);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
}

#cover-section {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex-shrink: 0;
}

#cover-thumb {
  width: 44px; height: 44px;
  border-radius: 6px;
  object-fit: cover;
  background: rgba(255,255,255,0.05);
}

#track-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
  margin-right: 6px;
}

#track-title {
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}

#track-artist {
  font-size: 11px;
  color: rgba(255,255,255,0.5);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}

#controls-group {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  justify-content: center;
}

.ctrl-btn {
  background: none;
  border: none;
  color: rgba(255,255,255,0.8);
  font-size: 16px;
  width: 32px; height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.ctrl-btn:hover {
  background: rgba(255,255,255,0.08);
  color: #fff;
}

.ctrl-btn.play-btn {
  font-size: 22px;
  width: 40px; height: 40px;
  background: rgba(255,255,255,0.12);
  color: #fff;
}

.ctrl-btn.play-btn:hover {
  background: rgba(255,255,255,0.2);
}

/* === 文件上传按钮（隐藏） === */
#file-input { display: none; }

/* === 响应式 === */
@media (max-width: 640px) {
  #controls-bar {
    padding: 10px 10px;
    width: calc(100vw - 12px);
    gap: 4px;
  }
  #track-title { max-width: 60px; font-size: 12px; }
  #track-artist { display: none; }
  .ctrl-btn { font-size: 14px; width: 28px; height: 28px; }
  .ctrl-btn.play-btn { font-size: 18px; width: 34px; height: 34px; }
  #cover-thumb { width: 36px; height: 36px; }
  #btn-like, #btn-add, #btn-repeat, #btn-menu { display: none; }
  #progress-bar { width: calc(100vw - 24px); }
  #time-current { right: calc(50% + 45vw - 12px); font-size: 10px; }
  #time-total { left: calc(50% + 45vw - 12px); font-size: 10px; }
}
```

---

### Task 3: 视频背景模块 — video-bg.js

**Files:**
- Create: `video-bg.js`

- [ ] **Step 1: 创建 video-bg.js**

```js
// video-bg.js — 背景视频控制
export function createVideoBg(videoSrc) {
  const video = document.getElementById('bg-video')
  
  function load(src) {
    video.src = src
    video.play().catch(() => {})
  }
  
  function play() { video.play().catch(() => {}) }
  function pause() { video.pause() }
  
  // 测试阶段用默认视频（后续由用户提供实际视频）
  if (videoSrc) load(videoSrc)
  
  return { load, play, pause, element: video }
}
```

---

### Task 4: 进度条模块 — progress-bar.js

**Files:**
- Create: `progress-bar.js`

- [ ] **Step 1: 创建 progress-bar.js**

```js
// progress-bar.js — 顶部进度条
export function createProgressBar() {
  const bar = document.getElementById('progress-bar')
  const fill = document.getElementById('progress-fill')
  const thumb = document.getElementById('progress-thumb')
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
```

---

### Task 5: 歌词显示模块 — lyrics-display.js

**Files:**
- Create: `lyrics-display.js`

- [ ] **Step 1: 创建 lyrics-display.js**

```js
// lyrics-display.js — 歌词三级策略系统

const LYRICS_API_BASE = 'https://api.lyrics.ovh/v1'

export function createLyricsDisplay() {
  const line1 = document.getElementById('lyrics-line-1')
  const line2 = document.getElementById('lyrics-line-2')
  const line3 = document.getElementById('lyrics-line-3')

  function setLines(prev, current, next) {
    line1.textContent = prev || ''
    line2.textContent = current || ''
    line3.textContent = next || ''
  }

  function clear() {
    line1.textContent = ''
    line2.textContent = ''
    line3.textContent = ''
  }

  // 内置演示歌词（带时间轴，单位：秒）
  const DEMO_LYRICS = [
    { time: 0, text: 'We don\'t talk anymore' },
    { time: 3.5, text: 'We don\'t talk anymore' },
    { time: 7, text: 'We don\'t talk anymore' },
    { time: 10.5, text: 'Like we used to do' },
    { time: 14, text: 'We don\'t love anymore' },
    { time: 17.5, text: 'What was all of it for' },
    { time: 21, text: 'Oh, we don\'t talk anymore' },
    { time: 24.5, text: 'Like we used to do' },
    { time: 28, text: 'I just heard you found the one' },
    { time: 31.5, text: "You've been looking for" },
    { time: 35, text: 'I wish I would have known that wasn\'t me' },
    { time: 38.5, text: 'And even after all this time' },
    { time: 42, text: "I still wish you'd be mine" },
  ]

  function getDemoLyrics() { return DEMO_LYRICS }

  // 从 lyrics.ovh 获取歌词
  async function fetchLyrics(artist, title) {
    try {
      const res = await fetch(`${LYRICS_API_BASE}/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`)
      if (!res.ok) return null
      const data = await res.json()
      return data.lyrics || null
    } catch {
      return null
    }
  }

  // 将纯歌词文本估算为带时间轴的条目（假设均匀分布在歌曲时长内）
  function estimateTiming(lyricsText, duration) {
    const lines = lyricsText.split('\n').filter(l => l.trim())
    if (lines.length === 0) return null
    if (lines.length > 50) {
      // 过多行数，取前 30 行
      lines.splice(30)
    }
    const interval = duration / (lines.length + 1)
    return lines.map((text, i) => ({
      time: (i + 1) * interval,
      text: text.trim()
    }))
  }

  async function loadForTrack(artist, title, duration) {
    // 尝试 API
    const text = await fetchLyrics(artist, title)
    if (text) {
      const timed = estimateTiming(text, duration)
      if (timed) return timed
    }
    // 兜底：显示歌曲名
    return null
  }

  return { setLines, clear, getDemoLyrics, loadForTrack, estimateTiming }
}

// 歌词滚动更新函数（由主循环驱动）
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

  if (activeIdx === -1) {
    display.setLines('', lyricsData[0]?.text || '', lyricsData[1]?.text || '')
  } else if (activeIdx >= lyricsData.length - 1) {
    const prev = lyricsData[lyricsData.length - 2]?.text || ''
    const cur = lyricsData[lyricsData.length - 1]?.text || ''
    display.setLines(prev, cur, '')
  } else {
    const prev = lyricsData[activeIdx - 1]?.text || ''
    const cur = lyricsData[activeIdx]?.text || ''
    const next = lyricsData[activeIdx + 1]?.text || ''
    display.setLines(prev, cur, next)
  }
}
```

---

### Task 6: 重写音频引擎 — audio/player.js（适配新架构）

**Files:**
- Modify: `audio/player.js`

- [ ] **Step 1: 重写 player.js（保持核心功能，简化接口）**

核心逻辑基本不变，但需要提取 ID3 标签。`player.js` 保留原样（已有 `loadTrack`, `play`, `pause`, `togglePlay`, `seek`, `setVolume`, `on` 等接口），增加元数据提取能力。

```js
// audio/player.js 保持原有代码，增加 getMetadata 方法
// 在文件末尾添加：

import { parse } from 'jsmediatags'

export function readMetadata(file) {
  return new Promise((resolve) => {
    parse(file, {
      onSuccess: (tag) => {
        const { title, artist, album, picture } = tag.tags
        resolve({
          title: title || file.name.replace(/\.[^/.]+$/, ''),
          artist: artist || '',
          album: album || '',
          picture: picture ? {
            data: picture.data,
            format: picture.format
          } : null
        })
      },
      onError: () => {
        resolve({
          title: file.name.replace(/\.[^/.]+$/, ''),
          artist: '',
          album: '',
          picture: null
        })
      }
    })
  })
}
```

---

### Task 7: 简化曲目管理 — ui/tracklist.js

**Files:**
- Modify: `ui/tracklist.js`

- [ ] **Step 1: 更新 tracklist.js 适配新 UI（移除对旧 controls.js 的依赖）**

不再需要 DOM 侧边栏渲染（简化），只保留曲目列表逻辑和事件。

---

### Task 8: 重构 main.js — 组装新模块

**Files:**
- Modify: `main.js`

- [ ] **Step 1: 写入新 main.js**

```js
import { createVideoBg } from './video-bg.js'
import { createProgressBar } from './progress-bar.js'
import { createLyricsDisplay, updateLyricsDisplay } from './lyrics-display.js'
import { createPlayer, readMetadata } from './audio/player.js'
import { createTrackList } from './ui/tracklist.js'

// 初始化模块
const videoBg = createVideoBg()
const progressBar = createProgressBar()
const lyricsDisplay = createLyricsDisplay()
const player = createPlayer()
const trackList = createTrackList()

let isPlaying = false
let currentLyrics = null
let currentDuration = 0

// === 加载音轨 ===
let synthDemoActive = false

async function loadTrack(track) {
  lyricsDisplay.clear()
  currentLyrics = null

  if (track.type === 'synth') {
    // 内置演示曲：使用现有 analyzer 的 synth demo
    const { createAnalyzer } = await import('./audio/analyzer.js')
    const analyzer = createAnalyzer()
    analyzer.startSynthDemo()
    synthDemoActive = true
    currentDuration = 60
    progressBar.setDuration(currentDuration)
    currentLyrics = lyricsDisplay.getDemoLyrics()
    isPlaying = true
    document.getElementById('btn-play').textContent = '⏸'
    updateUI('synth', '演示曲目', '内置音效')

    // synth demo 的时间由 requestAnimationFrame 驱动
    let synthTime = 0
    function tickSynth() {
      if (!synthDemoActive) return
      synthTime += 0.016
      progressBar.update(synthTime, currentDuration)
      if (currentLyrics) updateLyricsDisplay(currentLyrics, synthTime, lyricsDisplay)
      if (synthTime < currentDuration) requestAnimationFrame(tickSynth)
    }
    tickSynth()
  } else if (track.type === 'file') {
    synthDemoActive = false
    player.loadTrack(track.url)
    setTimeout(() => player.play(), 200)

    if (track.metadata) {
      const { title, artist } = track.metadata
      updateUI('file', title, artist)
      const lyrics = await lyricsDisplay.loadForTrack(artist, title, track.duration || 240)
      if (lyrics) currentLyrics = lyrics
    }
  }
}

function updateUI(type, title, artist) {
  document.getElementById('track-title').textContent = title || '未知曲目'
  document.getElementById('track-artist').textContent = artist || ''
  if (type === 'synth') {
    document.getElementById('cover-thumb').src = '/favicon.svg'
  }
}

// === 播放器事件绑定 ===
trackList.on('onTrackSelect', (track) => { loadTrack(track) })

player.on('onPlay', () => {
  isPlaying = true
  document.getElementById('btn-play').textContent = '⏸'
})
player.on('onPause', () => {
  isPlaying = false
  document.getElementById('btn-play').textContent = '▶'
})
player.on('onTimeUpdate', (current, duration) => {
  if (duration && isFinite(duration)) currentDuration = duration
  progressBar.update(current, currentDuration)
  if (currentLyrics) updateLyricsDisplay(currentLyrics, current, lyricsDisplay)
})
player.on('onEnded', () => {
  trackList.selectNext()
})

progressBar.onSeek((time) => {
  player.seek(time)
})

// === 控制栏按钮绑定 ===
document.getElementById('btn-play').addEventListener('click', () => {
  const track = trackList.getCurrentTrack()
  if (!track) return
  if (player.getState().playing) {
    player.pause()
  } else {
    if (player.getState().currentTime === 0 && !player.getState().playing) {
      loadTrack(track)
    } else {
      player.play()
    }
  }
})

document.getElementById('btn-prev').addEventListener('click', () => trackList.selectPrev())
document.getElementById('btn-next').addEventListener('click', () => trackList.selectNext())

document.getElementById('btn-volume').addEventListener('click', () => {
  const state = player.getState()
  if (state.volume > 0) {
    player.setVolume(0)
    document.getElementById('btn-volume').textContent = '🔇'
  } else {
    player.setVolume(0.7)
    document.getElementById('btn-volume').textContent = '🔊'
  }
})

document.getElementById('btn-fullscreen').addEventListener('click', () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
})

// 上传文件
document.getElementById('cover-thumb').addEventListener('click', () => {
  document.getElementById('file-input').click()
})
document.getElementById('file-input').addEventListener('change', async (e) => {
  for (const file of e.target.files) {
    const url = URL.createObjectURL(file)
    const metadata = await readMetadata(file)
    const name = metadata.title || file.name.replace(/\.[^/.]+$/, '')
    const track = {
      name,
      url,
      type: 'file',
      source: 'local',
      metadata,
      duration: 0
    }
    trackList.addTrack(track)
    trackList.selectLast()
  }
  e.target.value = ''
})

// 自动加载默认曲目
const defaultTrack = trackList.getCurrentTrack()
if (defaultTrack) loadTrack(defaultTrack)
```

---

### Task 9: 创建测试背景视频（临时）

需要一个测试用的背景视频代替最终视频。由于无法生成视频，创建一段 CSS 动画作为临时背景，或者使用一张静态图片。

- [ ] **Step 1: 创建 CSS 动画临时背景（无视频时兜底）**

在 `style.css` 中添加：
```css
#bg-video { display: none; }
#app {
  background: linear-gradient(135deg, #1a3a2a 0%, #2d5a3d 30%, #4a7a5a 60%, #6b9a7a 100%);
}
```

用户后续替换背景视频时，只需提供视频 URL 给 `createVideoBg()`。

---

### Task 10: 验证

- [ ] **Step 1: 启动 dev server**

```bash
cd "D:/本地浏览器下载/动画skill/music-visualizer"
npx vite --host
```

- [ ] **Step 2: 浏览器打开 http://localhost:5173**
- [ ] **Step 3: 验证点清单**
  - 控制栏 12 个元素按正确顺序排列
  - 毛玻璃效果可见
  - 进度条可拖动
  - 点击播放按钮开始演示音轨
  - 歌词三行依次滚动
  - 上传本地音乐文件可正常播放
  - 响应式布局在窄屏下正确收缩
