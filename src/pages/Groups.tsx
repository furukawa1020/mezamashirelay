import React, { useState } from 'react'
import { useAuth } from '../services/auth'
import { createGroup, joinGroup } from '../services/firestore'

export default function Groups(){
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [mode, setMode] = useState<'RACE'|'ALL'>('RACE')
  const [joinId, setJoinId] = useState('')

  const onCreate = async ()=>{
    if(!user) return
    const gid = await createGroup(user.uid, name, mode)
    alert('グループ作成: ' + gid)
    setName('')
  }

  const onJoin = async ()=>{
    if(!user) return
    try{
      await joinGroup(user.uid, joinId)
      alert('参加しました')
      setJoinId('')
    }catch(e:any){
      alert('参加失敗: '+e.message)
    }
  }

  return (
    <div className="container">
      <h2>グループ</h2>
      <div className="card">
        <label>グループ名</label>
        <input className="input" value={name} onChange={e=>setName(e.target.value)} />
        <label style={{marginTop:8}}>モード</label>
        <select className="input" value={mode} onChange={e=>setMode(e.target.value as any)}>
          <option value="RACE">RACE</option>
          <option value="ALL">ALL</option>
        </select>
        <div style={{marginTop:8}}>
          <button className="button" onClick={onCreate}>グループ作成</button>
        </div>
      </div>

      <div className="card">
        <h3>招待で参加</h3>
        <label>招待コード / グループID</label>
        <input className="input" value={joinId} onChange={e=>setJoinId(e.target.value)} />
        <div style={{marginTop:8}}>
          <button className="button" onClick={onJoin}>参加</button>
        </div>
      </div>
    </div>
  )
}
