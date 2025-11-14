import React, { useState } from 'react'
import { useAuth } from '../services/auth'
import Missions from './Missions'
import Groups from './Groups'
import { startSession } from '../services/firestore'

export default function Dashboard(){
  const { user, signOut } = useAuth()
  const [view, setView] = useState<'home'|'missions'|'groups'>('home')

  const onStart = async ()=>{
    if(!user) return alert('ログインしてください')
    // 簡易: 最初の自分の mission を取得してセッション開始する流れにする
    try{
      // TODO: ここは本来ミッション選択UIにする
      const missionId = prompt('開始するミッションIDを入力（まずは作成してください）')
      if(!missionId) return
      const sid = await startSession(user.uid, missionId)
      alert('セッション開始: ' + sid)
    }catch(e:any){
      alert('開始に失敗しました: '+e.message)
    }
  }

  return (
    <div className="container">
      <h2>ようこそ、{user?.displayName || user?.email}</h2>

      <nav style={{display:'flex',gap:12,marginBottom:12,flexWrap:'wrap'}}>
        <button className="button" onClick={()=>setView('home')}>ホーム</button>
        <button className="button" onClick={()=>setView('missions')}>ミッション</button>
        <button className="button" onClick={()=>setView('groups')}>グループ</button>
        <button className="button" onClick={onStart}>今日のセッション開始</button>
      </nav>

      {view==='home' && (
        <div className="card">
          <h3>今日の起床セッション</h3>
          <p>ここに当日のステップ進行 UI を実装します。BLE/NFC はスタブで代替可能です。</p>
          <div className="card">
            <h4>デバッグ: BLE/NFC ダミー</h4>
            <p>ダミーイベントを送信してステップ完了処理を検証できます。</p>
            <button className="button" onClick={()=>{
              window.dispatchEvent(new CustomEvent('mezamashi:step', { detail: { type:'manual', stepId:'debug-1' } }))
              alert('ダミーイベントを送信しました')
            }}>ダミー完了</button>
          </div>
        </div>
      )}

      {view==='missions' && <Missions />}
      {view==='groups' && <Groups />}
    </div>
  )
}
