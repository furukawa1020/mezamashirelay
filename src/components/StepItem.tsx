import React, { useEffect, useState } from 'react'

export default function StepItem({step, onComplete}:{step:any; onComplete:(id:string)=>void}){
  const [done,setDone] = useState(step.result === 'success')

  useEffect(()=>{
    setDone(step.result === 'success')
  },[step.result])

  return (
    <div className={`step-item ${done? 'done':''}`} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:12,borderRadius:10,transition:'transform .18s ease, box-shadow .18s ease'}}>
      <div>
        <div style={{fontWeight:600}}>{step.label}</div>
        <div className="sub small">{step.type || 'manual'}</div>
      </div>
      <div>
        {done ? <span style={{color:'#0ca85f',fontWeight:700}}>完了</span> : <button className="button" onClick={()=>onComplete(step.id)}>完了にする</button>}
      </div>
    </div>
  )
}
