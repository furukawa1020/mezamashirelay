import React, { useEffect, useState } from 'react'
import { useAuth } from '../services/auth'
import { createMission, listMissions } from '../services/firestore'

export default function Missions(){
  const { user } = useAuth()
  const [missions, setMissions] = useState<any[]>([])
  const [name, setName] = useState('')
  const [wakeTime, setWakeTime] = useState('07:00')

  useEffect(()=>{
    if(!user) return
    listMissions(user.uid).then(setMissions).catch(()=>{})
  },[user])

  const add = async ()=>{
    if(!user) return
    await createMission(user.uid, { name, wake_time: wakeTime })
    setName('')
    const updated = await listMissions(user.uid)
    setMissions(updated)
  }

  return (
    <div className="container">
      <h2>ミッション</h2>
      <div className="card">
        <label>ミッション名</label>
        <input className="input" value={name} onChange={e=>setName(e.target.value)} />
        <label style={{marginTop:8}}>起床時間</label>
        <input className="input" type="time" value={wakeTime} onChange={e=>setWakeTime(e.target.value)} />
        <div style={{marginTop:8}}>
          <button className="button" onClick={add}>追加</button>
        </div>
      </div>

      <div className="card">
        <h3>あなたのミッション一覧</h3>
        {missions.length===0 && <div>まだミッションがありません</div>}
        {missions.map(m=> (
          <div key={m.id} style={{padding:8,borderBottom:'1px solid #eee'}}>
            <strong>{m.name}</strong> <div style={{fontSize:12,color:'#666'}}>起床時間: {m.wake_time}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
