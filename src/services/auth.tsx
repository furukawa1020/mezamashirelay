import React, { createContext, useContext, useEffect, useState } from 'react'
import { initializeApp } from 'firebase/app'
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth'

// TODO: 環境変数で置き換えてください
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

const AuthContext = createContext<any>({})

export function AuthProvider({ children }:{children:React.ReactNode}){
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    const unsub = onAuthStateChanged(auth, u=>{
      setUser(u)
      setLoading(false)
    })
    return ()=>unsub()
  },[])

  const login = (email:string,password:string)=> signInWithEmailAndPassword(auth,email,password)
  const register = (email:string,password:string)=> createUserWithEmailAndPassword(auth,email,password)
  const signOut = ()=> fbSignOut(auth)
  const loginWithGoogle = ()=> signInWithPopup(auth,new GoogleAuthProvider())

  return (
    <AuthContext.Provider value={{user,loading,login,register,signOut,loginWithGoogle}}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(){
  return useContext(AuthContext)
}
