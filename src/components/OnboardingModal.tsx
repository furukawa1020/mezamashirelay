import React from 'react'
import { useAuth } from '../services/auth'

export default function OnboardingModal({ open, onClose }:{open:boolean; onClose:()=>void}){
  const auth = useAuth?.()
  const allowAccount = import.meta.env.VITE_USE_FIREBASE === '1' && !!auth?.sendAccountClaimLink

  if(!open) return null
  return (
    <div role="dialog" aria-modal="true" style={{position:'fixed',left:0,top:0,right:0,bottom:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(10,10,12,0.36)'}} onClick={onClose}>
      <div style={{width:460,background:'white',borderRadius:12,padding:20,boxShadow:'0 24px 60px rgba(2,6,23,0.18)'}} onClick={e=>e.stopPropagation()}>
        <h2 style={{margin:0,marginBottom:8}}>はじめに — ローカルモード</h2>
        <p style={{marginTop:0,color:'#374151'}}>このモードはバックエンドを使わず、端末のローカル保存だけで動きます。すぐに試せますが、データは端末にしか残りません。</p>
        <ul style={{color:'#374151'}}>
          <li>メールやパスワードは不要です。すぐ参加できます。</li>
          <li>他の端末との同期や復元はできません。</li>
          <li>公開運用やスパム対策が必要な場合は Firebase を使ってください（オプション）。</li>
        </ul>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:8,marginTop:12}}>
          <div style={{display:'flex',gap:8}}>
            {allowAccount && (
              <button className="button" onClick={async ()=>{
                const email = window.prompt('アカウント化するメールアドレスを入力してください')
                if(!email) return
                try{
                  const ok = await auth.sendAccountClaimLink(email)
                  if(ok) window.alert('メールを送信しました。受信したリンクでアカウントを確定してください。')
                  else window.alert('送信に失敗しました')
                }catch(e){ window.alert('送信中にエラーが発生しました') }
              }}>あとでアカウント化（メールで保存）</button>
            )}
          </div>
          <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
            <button className="button" onClick={()=>{ try{ localStorage.setItem('mz_seen_onboarding','1') }catch(e){}; onClose() }} style={{padding:'8px 10px',borderRadius:8}}>了解しました</button>
          </div>
        </div>
      </div>
    </div>
  )
}
