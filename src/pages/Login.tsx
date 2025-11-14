import React, { useState } from 'react'
import { useAuth } from '../services/auth'

export default function Login(){
  const { login, register, loginWithGoogle } = useAuth()
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const [mode,setMode] = useState<'login'|'register'>('login')
  const [error,setError] = useState<string | null>(null)

  const submit = async ()=>{
    setError(null)
    try{
      if(mode==='login') await login(email,password)
      else await register(email,password)
    }catch(e:any){
      setError(e.message)
    }
  }

  return (
    <div className="container">
      <h1>めざましリレー</h1>
      <div className="card">
        <label>メール</label>
        <input className="input" value={email} onChange={e=>setEmail(e.target.value)} />
        <label>パスワード</label>
        <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <div style={{marginTop:8}}>
          <button className="button" onClick={submit}>{mode==='login'?'ログイン':'登録'}</button>
          <button style={{marginLeft:8}} onClick={()=>setMode(mode==='login'?'register':'login')}>{mode==='login'?'新規登録':'ログイン画面へ'}</button>
        </div>
        <div style={{marginTop:8}}>
          <button className="button" onClick={loginWithGoogle}>Googleでログイン</button>
        </div>
        {error && <div style={{color:'crimson',marginTop:8}}>{error}</div>}
      </div>
      <div style={{fontSize:12,color:'#666'}}>このプロトタイプは Firebase の設定が必要です。README を参照してください。</div>
    </div>
  )
}
