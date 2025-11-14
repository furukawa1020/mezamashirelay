import React, { createContext, useContext, useEffect, useState } from 'react'

type LocalUser = { id: string; name: string }

const LocalAuthContext = createContext<any>({})

function genId(){ return 'local-' + Math.random().toString(36).slice(2,9) }

export function LocalAuthProvider({ children }:{children:React.ReactNode}){
  const [user, setUser] = useState<LocalUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    try{
      const raw = localStorage.getItem('mz_local_user')
      if(raw){ setUser(JSON.parse(raw)) }
      else {
        const u = { id: genId(), name: 'ゲスト' }
        localStorage.setItem('mz_local_user', JSON.stringify(u))
        setUser(u)
      }
    }catch(e){
      setUser({ id: genId(), name: 'ゲスト' })
    }
    setLoading(false)
  },[])

  const setName = async (name:string)=>{
    if(!user) return
    const nu = { ...user, name }
    setUser(nu)
    try{ localStorage.setItem('mz_local_user', JSON.stringify(nu)) }catch(e){}
  }

  const signOut = async ()=>{
    try{ localStorage.removeItem('mz_local_user') }catch(e){}
    setUser(null)
  }

  return (
    <LocalAuthContext.Provider value={{ user, loading, setName, signOut, isLocal:true }}>
      {children}
    </LocalAuthContext.Provider>
  )
}

export function useLocalAuth(){ return useContext(LocalAuthContext) }

export default LocalAuthProvider
