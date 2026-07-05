import { createVideoBg } from './video-bg.js'
import { createProgressBar } from './progress-bar.js'
import { createLyricsDisplay, updateLyricsDisplay } from './lyrics-display.js'
import { createPlayer, readMetadata } from './audio/player.js'
import { createTrackList } from './ui/tracklist.js'
import { createPlaylistDrawer } from './ui/playlist-drawer.js'

// 初始化模块
const videoBg = createVideoBg('/bg.mp4')
const progressBar = createProgressBar()
const lyricsDisplay = createLyricsDisplay()
const player = createPlayer()
const trackList = createTrackList()
const playlistDrawer = createPlaylistDrawer(trackList, (idx) => {
  const track = trackList.selectIndex(idx)
  if (track) loadTrack(track)
})

let currentLyrics = null
let currentDuration = 0
let synthDemoActive = false
let repeatMode = 0
let lyricsVisible = true
let quoteTimer = null
let quoteInterval = null

const QUOTES = [
  { text: '草在结它的种子，风在摇它的叶子。我们站着，不说话，就十分美好。', author: '顾城' },
  { text: '万物皆有裂痕，那是光照进来的地方。', author: '莱昂纳德·科恩' },
  { text: '人生如逆旅，我亦是行人。', author: '苏轼' },
  { text: '一定要爱着点什么，恰似草木对光阴的钟情。', author: '汪曾祺' },
  { text: '行到水穷处，坐看云起时。', author: '王维' },
  { text: '世界是自己的，与他人毫无关系。', author: '杨绛' },
  { text: '此心安处是吾乡。', author: '苏轼' },
  { text: '凡是过去，皆为序章。', author: '莎士比亚' },
  { text: '不乱于心，不困于情，不畏将来，不念过往。', author: '丰子恺' },
  { text: '人间有味是清欢。', author: '苏轼' },
  { text: '总之岁月漫长，然而值得等待。', author: '村上春树' },
  { text: '醉后不知天在水，满船清梦压星河。', author: '唐珙' },
  { text: '莫愁千里路，自有到来风。', author: '钱珝' },
  { text: '内心丰盈者，独行也如众。', author: '佚名' },
]

function showQuote() {
  const q = QUOTES[Math.floor(Math.random() * QUOTES.length)]
  document.getElementById('lyrics-scroll').innerHTML = `
    <p class="lyrics-line quote-text">${q.text}</p>
    <p class="lyrics-line quote-author">— ${q.author}</p>
  `
}

function startQuoteCycle() {
  showQuote()
  clearInterval(quoteInterval)
  clearTimeout(quoteTimer)
  quoteTimer = setTimeout(() => {
    showQuote()
    quoteInterval = setInterval(showQuote, 10000)
  }, 30000)
}

function stopQuoteCycle() {
  clearTimeout(quoteTimer)
  clearInterval(quoteInterval)
}

function showLoading(on) {
  document.getElementById('loading-overlay').classList.toggle('active', on)
}

// === 加载音轨 ===
async function loadTrack(track) {
  lyricsDisplay.clear()
  currentLyrics = null
  showLoading(true)

  if (track.type === 'synth') {
    const { createAnalyzer } = await import('./audio/analyzer.js')
    const analyzer = createAnalyzer()
    analyzer.startSynthDemo()
    synthDemoActive = true
    currentDuration = 60
    progressBar.setDuration(currentDuration)
    currentLyrics = lyricsDisplay.getDemoLyrics()
    lyricsDisplay.loadLines(currentLyrics)
    document.getElementById('btn-play').textContent = '⏸'
    updateUI('演示曲目', '内置音效')

    let synthTime = 0
    function tickSynth() {
      if (!synthDemoActive) return
      synthTime += 0.016
      progressBar.update(synthTime, currentDuration)
      if (currentLyrics) updateLyricsDisplay(currentLyrics, synthTime, lyricsDisplay)
      if (synthTime < currentDuration) requestAnimationFrame(tickSynth)
    }
    tickSynth()
    showLoading(false)
  } else if (track.type === 'file') {
    synthDemoActive = false
    // 预加载音频，暂不播放
    player.loadTrack(track.url)

    if (track.metadata) {
      const { title, artist, picture } = track.metadata
      updateUI(title, artist, picture)

      // 等音频元数据加载完，拿到实际时长
      const actualDuration = await new Promise(resolve => {
        const dur = player.getState().duration
        if (dur && dur > 0) resolve(dur)
        else player.on('onLoaded', resolve)
      })

      // 再用实际时长去匹配歌词（选时长最接近的版本，自动缩放时间轴）
      const lyrics = await lyricsDisplay.loadForTrack(artist, title, actualDuration || 240)
      if (lyrics) {
        currentLyrics = lyrics
        lyricsDisplay.loadLines(lyrics)
      }

      const matchedArtist = lyricsDisplay.getMatchedArtist()
      if (matchedArtist && matchedArtist !== artist) {
        updateUI(title, matchedArtist)
      }
    }

    // 音频 + 歌词都就绪，开始播放
    showLoading(false)
    player.play()
  }
}

function updateUI(title, artist, picture) {
  document.getElementById('track-title').textContent = title || '未知曲目'
  document.getElementById('track-artist').textContent = artist || ''
  if (picture) {
    const blob = new Blob([new Uint8Array(picture.data)], { type: picture.format })
    document.getElementById('cover-thumb').src = URL.createObjectURL(blob)
  }
}

// === 播放器事件绑定 ===
trackList.on('onTrackSelect', (track) => {
  stopQuoteCycle()
  loadTrack(track)
})

player.on('onPlay', () => {
  document.getElementById('btn-play').textContent = '⏸'
})
player.on('onPause', () => {
  document.getElementById('btn-play').textContent = '▶'
})
player.on('onTimeUpdate', (current, duration) => {
  if (duration && isFinite(duration)) currentDuration = duration
  progressBar.update(current, currentDuration)
  if (currentLyrics) updateLyricsDisplay(currentLyrics, current, lyricsDisplay)
})
player.on('onEnded', () => {
  if (repeatMode === 2) {
    player.seek(0)
    setTimeout(() => player.play(), 100)
  } else {
    trackList.selectNext()
  }
})

progressBar.onSeek((time) => {
  player.seek(time)
})

// === 控制栏按钮绑定 ===
document.getElementById('btn-play').addEventListener('click', () => {
  const track = trackList.getCurrentTrack()
  if (!track) return
  const state = player.getState()
  if (state.playing) {
    player.pause()
  } else if (state.currentTime > 0) {
    player.play()
  } else {
    loadTrack(track)
  }
})

document.getElementById('btn-prev').addEventListener('click', () => trackList.selectPrev())
document.getElementById('btn-next').addEventListener('click', () => trackList.selectNext())

const volumeBtn = document.getElementById('btn-volume')
const volumeSlider = document.getElementById('volume-slider')

volumeBtn.addEventListener('click', () => {
  const state = player.getState()
  if (state.volume > 0) {
    volumeSlider.dataset.prev = state.volume
    player.setVolume(0)
    volumeSlider.value = 0
    volumeBtn.textContent = '🔇'
  } else {
    const prev = parseFloat(volumeSlider.dataset.prev) || 0.7
    player.setVolume(prev)
    volumeSlider.value = prev
    volumeBtn.textContent = prev > 0.5 ? '🔊' : prev > 0.1 ? '🔉' : '🔈'
  }
})

volumeSlider.addEventListener('input', () => {
  const val = parseFloat(volumeSlider.value)
  player.setVolume(val)
  volumeBtn.textContent = val === 0 ? '🔇' : val < 0.3 ? '🔈' : val < 0.7 ? '🔉' : '🔊'
})

document.getElementById('btn-fullscreen').addEventListener('click', () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
})

// === 循环模式：顺序播放 → 列表循环 → 单曲循环 ===
const repeatBtn = document.getElementById('btn-repeat')
const REPEAT_STATES = [
  { icon: '🔁', title: '顺序播放' },
  { icon: '🔁', title: '列表循环', active: true },
  { icon: '🔂', title: '单曲循环', active: true }
]

repeatBtn.addEventListener('click', () => {
  repeatMode = (repeatMode + 1) % 3
  const state = REPEAT_STATES[repeatMode]
  repeatBtn.textContent = state.icon
  repeatBtn.title = state.title
  repeatBtn.style.opacity = state.active ? '1' : '0.5'
})

// === 播放列表抽屉 ===
document.getElementById('btn-playlist').addEventListener('click', () => {
  playlistDrawer.toggle()
})

// === 歌词显示切换 ===
const lyricsContainer = document.getElementById('lyrics-container')
document.getElementById('btn-lyrics').addEventListener('click', () => {
  lyricsVisible = !lyricsVisible
  lyricsContainer.style.opacity = lyricsVisible ? '1' : '0'
  lyricsContainer.style.pointerEvents = lyricsVisible ? 'auto' : 'none'
})

// 上传文件
document.getElementById('cover-thumb').addEventListener('click', () => {
  document.getElementById('file-input').click()
})
document.getElementById('file-input').addEventListener('change', async (e) => {
  for (const file of e.target.files) {
    await handleFile(file)
  }
  e.target.value = ''
})

// === 拖拽上传 ===
document.addEventListener('dragover', (e) => { e.preventDefault() })
document.addEventListener('drop', async (e) => {
  e.preventDefault()
  for (const file of e.dataTransfer.files) {
    if (!file.type.startsWith('audio/')) continue
    await handleFile(file)
  }
})

// === 通用文件处理 ===
async function handleFile(file) {
  const url = URL.createObjectURL(file)
  const metadata = await readMetadata(file)
  const name = metadata.title || file.name.replace(/\.[^/.]+$/, '')
  const track = { name, url, type: 'file', source: 'local', metadata, duration: 0 }
  trackList.addTrack(track)

  if (metadata.picture) {
    const blob = new Blob([new Uint8Array(metadata.picture.data)], { type: metadata.picture.format })
    document.getElementById('cover-thumb').src = URL.createObjectURL(blob)
  }

  const state = player.getState()
  const isPlaying = state.playing || state.currentTime > 0
  if (!isPlaying) {
    trackList.selectLast()
  }
}

// === 键盘快捷键 ===
document.addEventListener('keydown', (e) => {
  if (e.target.matches('input, textarea, button')) return
  switch (e.code) {
    case 'Space':
      e.preventDefault()
      document.getElementById('btn-play').click()
      break
    case 'ArrowLeft':
      document.getElementById('btn-prev').click()
      break
    case 'ArrowRight':
      document.getElementById('btn-next').click()
      break
  }
})

// 启动文艺语录（无音乐时展示）
const defaultTrack = trackList.getCurrentTrack()
if (!defaultTrack) startQuoteCycle()

// === localStorage 记忆上次播放 ===
const lastTrack = localStorage.getItem('lastTrackName')
if (lastTrack) {
  const tracks = trackList.getAllTracks()
  const idx = tracks.findIndex(t => t.name === lastTrack)
  if (idx >= 0) trackList.selectIndex(idx)
}

// === 歌词点击跳转 ===
document.getElementById('lyrics-scroll').addEventListener('click', (e) => {
  const line = e.target.closest('.lyrics-line')
  if (!line || !currentLyrics) return
  const lineIdx = Array.from(line.parentElement.children).indexOf(line)
  const timedEntry = currentLyrics[lineIdx]
  if (timedEntry && timedEntry.time != null) {
    player.seek(timedEntry.time)
  }
})

trackList.on('onListChange', () => {
  const track = trackList.getCurrentTrack()
  if (track) localStorage.setItem('lastTrackName', track.name)
})
