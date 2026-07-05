export function createAnalyzer() {
  let audioCtx = null
  let analyser = null
  let dataArray = null
  let mode = 'idle'
  let mediaSource = null
  let synthNodes = null

  function ensureContext() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)()
      analyser = audioCtx.createAnalyser()
      analyser.fftSize = 256
      dataArray = new Uint8Array(analyser.frequencyBinCount)
      analyser.connect(audioCtx.destination)
    }
    return { audioCtx, analyser, dataArray }
  }

  function disconnectAllInputs() {
    if (synthNodes) {
      try { synthNodes.osc.stop() } catch (e) {}
      try { synthNodes.lfo.stop() } catch (e) {}
      try { synthNodes.osc.disconnect() } catch (e) {}
      try { synthNodes.lfo.disconnect() } catch (e) {}
      try { synthNodes.lfoGain.disconnect() } catch (e) {}
      try { synthNodes.gain.disconnect() } catch (e) {}
      synthNodes = null
    }
    try { if (mediaSource) mediaSource.disconnect() } catch (e) {}
    mode = 'idle'
  }

  function startSynthDemo() {
    ensureContext()
    disconnectAllInputs()

    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    gain.gain.value = 0.3

    const lfo = audioCtx.createOscillator()
    const lfoGain = audioCtx.createGain()
    lfo.frequency.value = 5
    lfoGain.gain.value = 180
    lfo.connect(lfoGain)
    lfoGain.connect(osc.frequency)

    osc.type = 'sawtooth'
    osc.frequency.value = 220
    osc.connect(gain)
    gain.connect(analyser)

    osc.start()
    lfo.start()
    synthNodes = { osc, gain, lfo, lfoGain }
    mode = 'synth'
  }

  function connectFileSource(audioElement) {
    ensureContext()
    disconnectAllInputs()

    if (!mediaSource) {
      mediaSource = audioCtx.createMediaElementSource(audioElement)
    }
    mediaSource.connect(analyser)
    mode = 'file'
  }

  function getFrequencyData() {
    if (!analyser) return new Uint8Array(128)
    analyser.getByteFrequencyData(dataArray)
    return dataArray
  }

  function getBassLevel() {
    if (!analyser) return 0
    analyser.getByteFrequencyData(dataArray)
    let sum = 0
    for (let i = 0; i < 6; i++) sum += dataArray[i]
    return sum / (6 * 255)
  }

  function resume() {
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume()
    }
  }

  function getMode() { return mode }

  return { startSynthDemo, connectFileSource, getFrequencyData, getBassLevel, resume, getMode }
}
