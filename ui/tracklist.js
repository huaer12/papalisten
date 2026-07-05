const DEMO_TRACKS = []

export function createTrackList() {
  let tracks = [...DEMO_TRACKS]
  let activeIndex = 0
  const callbacks = { onTrackSelect: null, onListChange: null }

  function getCurrentTrack() { return activeIndex >= 0 ? tracks[activeIndex] : null }
  function getAllTracks() { return tracks }
  function getActiveIndex() { return activeIndex }

  function selectIndex(idx) {
    if (idx < 0 || idx >= tracks.length) return null
    activeIndex = idx
    const track = tracks[idx]
    if (callbacks.onTrackSelect) callbacks.onTrackSelect(track, idx)
    if (callbacks.onListChange) callbacks.onListChange()
    return track
  }

  function selectNext() {
    if (tracks.length === 0) return null
    return selectIndex((activeIndex + 1) % tracks.length)
  }

  function selectPrev() {
    if (tracks.length === 0) return null
    return selectIndex((activeIndex - 1 + tracks.length) % tracks.length)
  }

  function addTrack(track) {
    tracks.push(track)
    if (callbacks.onListChange) callbacks.onListChange()
  }

  function selectLast() {
    if (tracks.length === 0) return null
    return selectIndex(tracks.length - 1)
  }

  function on(event, fn) {
    if (event in callbacks) callbacks[event] = fn
  }

  return { getCurrentTrack, getAllTracks, getActiveIndex, selectIndex, selectNext, selectPrev, addTrack, selectLast, on }
}
