import React from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import { useAuth } from './services/auth'

export default function App(){
  const { user, loading } = useAuth()

  if(loading) return <div style={{display:'flex',height:'100vh',alignItems:'center',justifyContent:'center'}}><div className="small muted">読み込み中…</div></div>
  if(!user) return <Login />
  return <Dashboard />
}
