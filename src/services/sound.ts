// Simple WebAudio-based sound helper for micro-interactions
export function playClick(){
  try{
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'sine'
    o.frequency.value = 880
    g.gain.value = 0.0001
    o.connect(g)
    g.connect(ctx.destination)
    const now = ctx.currentTime
    g.gain.exponentialRampToValueAtTime(0.12, now + 0.02)
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.18)
    o.start(now)
    o.stop(now + 0.19)
    // close context after a bit
    setTimeout(()=>{
      try{ ctx.close() }catch(e){}
    }, 500)
  }catch(e){
    // ignore
  }
}

export function playSuccess(){
  try{
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'triangle'
    o.frequency.value = 660
    g.gain.value = 0.0001
    o.connect(g)
    g.connect(ctx.destination)
    const now = ctx.currentTime
    g.gain.exponentialRampToValueAtTime(0.15, now + 0.01)
    o.frequency.setValueAtTime(660, now)
    o.frequency.exponentialRampToValueAtTime(880, now + 0.12)
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.32)
    o.start(now)
    o.stop(now + 0.35)
    setTimeout(()=>{ try{ ctx.close() }catch(e){} }, 600)
  }catch(e){ }
}
