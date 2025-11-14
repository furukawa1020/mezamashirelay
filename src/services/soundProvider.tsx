import React, { createContext, useContext, useState, useEffect } from 'react'

type SoundContextValue = { muted: boolean; setMuted: (v:boolean)=>void }
const SoundContext = createContext<SoundContextValue>({ muted:false, setMuted:()=>{} })

export function SoundProvider({ children }: { children: React.ReactNode }){
  const [muted, setMuted] = useState<boolean>(()=>{
    try{ return localStorage.getItem('mz_sound_muted') === '1' }catch(e){ return false }
  })
  useEffect(()=>{ try{ localStorage.setItem('mz_sound_muted', muted ? '1' : '0') }catch(e){} },[muted])
  return <SoundContext.Provider value={{muted, setMuted}}>{children}</SoundContext.Provider>
}

export function useSound(){
  return useContext(SoundContext)
}

function playTone(type:'click'|'success'){
  try{
    const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext
    const ctx = new Ctx()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = type === 'click' ? 'sine' : 'triangle'
    o.frequency.value = type === 'click' ? 880 : 660
    g.gain.value = 0.0001
    o.connect(g)
    g.connect(ctx.destination)
    const now = ctx.currentTime
    g.gain.exponentialRampToValueAtTime(type === 'click' ? 0.12 : 0.15, now + 0.02)
    g.gain.exponentialRampToValueAtTime(0.0001, now + (type === 'click' ? 0.18 : 0.32))
    if(type === 'success'){
      o.frequency.setValueAtTime(660, now)
      o.frequency.exponentialRampToValueAtTime(880, now + 0.12)
    }
    o.start(now)
    o.stop(now + (type === 'click' ? 0.19 : 0.35))
    setTimeout(()=>{ try{ ctx.close() }catch(e){} }, 600)
  }catch(e){ }
}

export function playClick(){ playTone('click') }
export function playSuccess(){ playTone('success') }
