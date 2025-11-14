import React from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import { useAuth } from './services/auth'
import Header from './components/Header'

export default function App(){
  const { user, loading } = useAuth()

  if(loading) return <div style={{display:'flex',height:'100vh',alignItems:'center',justifyContent:'center'}}><div className="small muted">読み込み中…</div></div>
  if(!user) return <Login />
  return (
    <div>
      <div className="container">
        <Header />
        <Dashboard />
      </div>
    </div>
  )
}
