import React, { useEffect, useState } from 'react'

export default function StepItem({step, onComplete}:{step:any; onComplete:(id:string)=>void}){
  const [done,setDone] = useState(step.result === 'success')

  useEffect(()=>{
    setDone(step.result === 'success')
  },[step.result])

  return (
    <div className={`step-item ${done? 'done':''}`}>
      <div style={{display:'flex',gap:12,alignItems:'center'}}>
        <div style={{width:40,height:40,display:'flex',alignItems:'center',justifyContent:'center',borderRadius:8,background:'#fbfcff',boxShadow:'inset 0 1px 0 rgba(255,255,255,0.6)'}}>
          <div className="checkmark" aria-hidden>{done ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 6L9 17l-5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          ) : null}</div>
        </div>
        <div>
          <div style={{fontWeight:600}}>{step.label}</div>
          <div className="sub small">{step.type || 'manual'}</div>
        </div>
      </div>

      <div>
        {done ? <span style={{color:'#0ca85f',fontWeight:700}}>完了</span> : <button className="button" onClick={()=>onComplete(step.id)}>完了にする</button>}
      </div>
    </div>
  )
}
