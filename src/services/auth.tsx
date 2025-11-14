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
import { signInAnonymously, sendSignInLinkToEmail, isSignInWithEmailLink, EmailAuthProvider, linkWithCredential, signInWithEmailLink } from 'firebase/auth'

// Use Vite env variables (VITE_FIREBASE_*) for deployment-safe config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'YOUR_API_KEY',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'YOUR_AUTH_DOMAIN',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'YOUR_PROJECT_ID',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || undefined
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

const AuthContext = createContext<any>({})

export function AuthProvider({ children }:{children:React.ReactNode}){
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [initializing, setInitializing] = useState(true)

  useEffect(()=>{
    const unsub = onAuthStateChanged(auth, u=>{
      setUser(u)
      setLoading(false)
      setInitializing(false)
    })
    return ()=>unsub()
  },[])

  // Ensure anonymous sign-in if no user
  useEffect(()=>{
    if(!initializing) return
    // if there's already a user, nothing to do
    if(auth.currentUser) { setInitializing(false); return }
    // Try to handle email-link sign-in first
    const href = typeof window !== 'undefined' ? window.location.href : ''
    if(href && isSignInWithEmailLink(auth, href)){
      // try to get email from localStorage
      const email = window.localStorage.getItem('mz_claim_email') || window.prompt('Please provide the email you used to sign in') || ''
      if(email){
        // If there is a current anonymous user, link; otherwise sign in with link
        if(auth.currentUser){
          try{
            const cred = EmailAuthProvider.credentialWithLink(email, href)
            linkWithCredential(auth.currentUser, cred).catch(()=>{
              // fallback: sign in with email link
              signInWithEmailLink(auth, email, href).catch(()=>{})
            })
          }catch(e){
            // fallback
            signInWithEmailLink(auth, email, href).catch(()=>{})
          }
        }else{
          signInWithEmailLink(auth, email, href).catch(()=>{})
        }
      }
    }

    // If still not signed in, sign in anonymously
    if(!auth.currentUser){
      signInAnonymously(auth).catch(()=>{})
    }
  },[initializing])

  const login = (email:string,password:string)=> signInWithEmailAndPassword(auth,email,password)
  const register = (email:string,password:string)=> createUserWithEmailAndPassword(auth,email,password)
  const signOut = ()=> fbSignOut(auth)
  const loginWithGoogle = ()=> signInWithPopup(auth,new GoogleAuthProvider())
  
  // send magic link to claim/upgrade anonymous account
  const sendAccountClaimLink = async (email:string) => {
    const actionCodeSettings = {
      // URL you want to redirect back to. The domain for this URL must be whitelisted in the Firebase Console.
      url: (typeof window !== 'undefined' ? window.location.href.split('#')[0] : '/') ,
      handleCodeInApp: true
    }
    try{
      await sendSignInLinkToEmail(auth, email, actionCodeSettings)
      // remember the email for when the user returns
      try{ localStorage.setItem('mz_claim_email', email) }catch(e){}
      return true
    }catch(e){ return false }
  }

  return (
    <AuthContext.Provider value={{user,loading,login,register,signOut,loginWithGoogle,sendAccountClaimLink}}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(){
  return useContext(AuthContext)
}
