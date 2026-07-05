// video-bg.js — 背景视频控制
export function createVideoBg(videoSrc) {
  const video = document.getElementById('bg-video')

  function load(src) {
    video.src = src
    video.play().catch(() => {})
  }

  function play() { video.play().catch(() => {}) }
  function pause() { video.pause() }

  if (videoSrc) load(videoSrc)

  return { load, play, pause, element: video }
}
