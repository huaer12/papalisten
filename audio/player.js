export function createPlayer() {
  const audio = new Audio()
  audio.crossOrigin = 'anonymous'
  audio.preload = 'auto'

  const callbacks = {
    onTimeUpdate: null,
    onPlay: null,
    onPause: null,
    onEnded: null,
    onLoaded: null,
    onError: null
  }

  audio.addEventListener('timeupdate', () => {
    if (callbacks.onTimeUpdate) callbacks.onTimeUpdate(audio.currentTime, audio.duration)
  })
  audio.addEventListener('play', () => {
    if (callbacks.onPlay) callbacks.onPlay()
  })
  audio.addEventListener('pause', () => {
    if (callbacks.onPause) callbacks.onPause()
  })
  audio.addEventListener('ended', () => {
    if (callbacks.onEnded) callbacks.onEnded()
  })
  audio.addEventListener('loadedmetadata', () => {
    if (callbacks.onLoaded) callbacks.onLoaded(audio.duration)
  })
  audio.addEventListener('error', () => {
    if (callbacks.onError) callbacks.onError(audio.error)
  })

  function loadTrack(url) {
    audio.src = url
    audio.load()
  }

  function play() {
    audio.play().catch(() => {})
  }

  function pause() {
    audio.pause()
  }

  function togglePlay() {
    if (audio.paused) play()
    else pause()
  }

  function seek(time) {
    audio.currentTime = time
  }

  function setVolume(level) {
    audio.volume = Math.max(0, Math.min(1, level))
  }

  function getState() {
    return {
      playing: !audio.paused,
      currentTime: audio.currentTime,
      duration: audio.duration || 0,
      volume: audio.volume
    }
  }

  function on(event, fn) {
    if (event in callbacks) callbacks[event] = fn
  }

  return { loadTrack, play, pause, togglePlay, seek, setVolume, getState, on, audio }
}

import { parseBlob } from 'music-metadata-browser'

export async function readMetadata(file) {
  try {
    const meta = await parseBlob(file)
    let { title, artist, album, picture } = meta.common
    // ID3 缺少 artist 时，尝试从文件名 "Artist - Title.mp3" 提取
    if (!artist) {
      const name = file.name.replace(/\.[^/.]+$/, '')
      const dashIdx = name.indexOf(' - ')
      if (dashIdx > 0) {
        artist = name.slice(0, dashIdx).trim()
        if (!title) title = name.slice(dashIdx + 3).trim()
      }
    }
    return {
      title: title || file.name.replace(/\.[^/.]+$/, ''),
      artist: artist || '',
      album: album || '',
      picture: picture || null
    }
  } catch {
    return {
      title: file.name.replace(/\.[^/.]+$/, ''),
      artist: '',
      album: '',
      picture: null
    }
  }
}
