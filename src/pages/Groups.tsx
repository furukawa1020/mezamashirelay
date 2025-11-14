import React, { useState } from 'react'
import { useAuth } from '../services/auth'
import { createGroup, joinGroup, listGroupMembers, getGroup, listTodaySessionsByGroup, getGroupDailyStatus } from '../services/firestore'

type Member = { id:string; user_id:string }

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

  const [loadedGroup, setLoadedGroup] = useState<any>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [todaySessions, setTodaySessions] = useState<any[]>([])
  const [dailyStatus, setDailyStatus] = useState<any>(null)

  const loadGroup = async (gid?:string)=>{
    const id = gid || prompt('読み込むグループIDを入力')
    if(!id) return
    const g = await getGroup(id)
    setLoadedGroup(g)
    const m = await listGroupMembers(id)
    setMembers(m)
    const s = await listTodaySessionsByGroup(id)
    setTodaySessions(s)
    const ds = await getGroupDailyStatus(id)
    setDailyStatus(ds)
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
          <button className="button" style={{marginLeft:8}} onClick={()=>loadGroup(joinId)}>このグループを表示</button>
        </div>
      </div>

      {loadedGroup && (
        <div className="card">
          <h3>グループ: {loadedGroup.name} ({loadedGroup.mode})</h3>
          <div>グループID: {loadedGroup.id}</div>
          <div style={{marginTop:8}}>
            <h4>メンバー ({members.length})</h4>
            {members.map(m=> <div key={m.id}>{m.user_id}</div>)}
          </div>
          <div style={{marginTop:8}}>
            <h4>今日のセッション ({todaySessions.length})</h4>
            {todaySessions.map(s=> <div key={s.id}>{s.user_id} — {s.status} {s.rank?`(rank:${s.rank})`:''}</div>)}
          </div>
          <div style={{marginTop:8}}>
            <h4>今日のステータス</h4>
            {dailyStatus ? <div>ALL Cleared: {dailyStatus.all_cleared ? 'はい' : 'いいえ'} / Streak: {dailyStatus.clear_streak}</div> : <div>まだ記録がありません</div>}
          </div>
        </div>
      )}
    </div>
  )
}
