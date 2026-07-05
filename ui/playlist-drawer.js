// playlist-drawer.js — 播放列表抽屉
export function createPlaylistDrawer(trackList, onTrackClick) {
  const drawer = document.getElementById('playlist-drawer')
  const backdrop = document.getElementById('playlist-backdrop')
  const itemsEl = document.getElementById('playlist-items')
  let currentActiveIndex = -1

  function open() {
    render()
    drawer.classList.add('open')
    backdrop.classList.add('open')
  }

  function close() {
    drawer.classList.remove('open')
    backdrop.classList.remove('open')
  }

  function toggle() {
    if (drawer.classList.contains('open')) close()
    else open()
  }

  function render() {
    const tracks = trackList.getAllTracks()
    const activeIdx = trackList.getActiveIndex()
    currentActiveIndex = activeIdx

    if (tracks.length === 0) {
      itemsEl.innerHTML = '<div style="padding:40px 20px;text-align:center;color:rgba(255,255,255,0.2);font-size:13px;">播放列表为空</div>'
      return
    }

    itemsEl.innerHTML = tracks.map((track, i) => {
      const isActive = i === activeIdx
      const artist = track.metadata?.artist || ''
      const typeLabel = track.type === 'synth' ? '演示' : ''
      return `
        <div class="playlist-item ${isActive ? 'active' : ''}" data-index="${i}">
          <span class="item-index">${i + 1}</span>
          <div class="item-info">
            <div class="item-title">${track.name || '未知曲目'}</div>
            ${artist ? `<div class="item-artist">${artist}</div>` : ''}
          </div>
          ${typeLabel ? `<span class="item-type">${typeLabel}</span>` : ''}
          <button class="item-delete" data-index="${i}">✕</button>
        </div>
      `
    }).join('')

    itemsEl.querySelectorAll('.playlist-item').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.classList.contains('item-delete')) return
        const idx = parseInt(el.dataset.index)
        close()
        onTrackClick(idx)
      })
    })

    itemsEl.querySelectorAll('.item-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation()
        const idx = parseInt(btn.dataset.index)
        if (idx === 0) return
        const allTracks = trackList.getAllTracks()
        const activeIdx = trackList.getActiveIndex()
        allTracks.splice(idx, 1)
        trackList.selectIndex(Math.max(0, activeIdx - 1))
        render()
      })
    })
  }

  // 监听列表变化，抽屉打开时刷新
  trackList.on('onListChange', () => {
    if (drawer.classList.contains('open')) render()
  })

  // 点击背景关闭
  backdrop.addEventListener('click', close)

  document.getElementById('playlist-close').addEventListener('click', close)

  return { open, close, toggle, render }
}
