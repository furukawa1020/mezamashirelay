import React from 'react'
import { useAuth } from '../services/auth'

export default function Dashboard(){
  const { user, signOut } = useAuth()

  return (
    <div className="container">
      <h2>ようこそ、{user?.displayName || user?.email}</h2>
      <div className="card">
        <h3>今日の起床セッション</h3>
        <p>ここにセッション開始・ステップの UI を実装します（MVP）。</p>
        <p>グループ機能、RACE/ALL のロジックは次フェーズで追加予定。</p>
        <div style={{marginTop:8}}>
          <button className="button" onClick={signOut}>サインアウト</button>
        </div>
      </div>

      <div className="card">
        <h3>デバッグ: BLE/NFC ダミー</h3>
        <p>現状はダミーイベント生成で動作確認できます。</p>
        <button className="button" onClick={()=>{
          // ダミー：ステップ完了イベントを発火（将来的に Web Bluetooth / NFC を使う）
          window.dispatchEvent(new CustomEvent('mezamashi:step', { detail: { type:'manual', stepId:'debug-1' } }))
          alert('ダミーイベントを送信しました')
        }}>ダミー完了</button>
      </div>
    </div>
  )
}
