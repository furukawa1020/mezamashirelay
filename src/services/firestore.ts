import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, doc, setDoc, getDocs, query, where, orderBy, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore'

// Use Vite env variables (VITE_FIREBASE_*) for deployment-safe config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'YOUR_API_KEY',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'YOUR_AUTH_DOMAIN',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'YOUR_PROJECT_ID',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || undefined
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// Missions
export async function createMission(userId: string, data: { name: string; wake_time: string; repeat_rule?: string }){
  const col = collection(db, 'missions')
  const docRef = await addDoc(col, {
    user_id: userId,
    name: data.name,
    wake_time: data.wake_time,
    repeat_rule: data.repeat_rule || 'everyday',
    created_at: serverTimestamp()
  })
  return docRef.id
}

export async function listMissions(userId: string){
  const q = query(collection(db,'missions'), where('user_id','==',userId), orderBy('created_at','desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d=>({ id:d.id, ...d.data() }))
}

// Mission Steps (top-level collection)
export async function createMissionStep(missionId: string, data: { label: string; order?: number; type?: string; nfc_tag_id?: string; ble_event_type?: string }){
  const col = collection(db,'mission_steps')
  const docRef = await addDoc(col, {
    mission_id: missionId,
    label: data.label,
    order: data.order || 0,
    type: data.type || 'manual',
    nfc_tag_id: data.nfc_tag_id || null,
    ble_event_type: data.ble_event_type || null
  })
  return docRef.id
}

export async function listMissionSteps(missionId: string){
  const q = query(collection(db,'mission_steps'), where('mission_id','==',missionId), orderBy('order','asc'))
  const snap = await getDocs(q)
  return snap.docs.map(d=>({ id:d.id, ...d.data() }))
}

// Groups
export async function createGroup(userId:string, name:string, mode:'RACE'|'ALL'){
  const col = collection(db,'groups')
  const docRef = await addDoc(col, {
    name, mode, owner_id: userId, created_at: serverTimestamp()
  })
  // create group membership
  await setDoc(doc(db,'group_members', `${docRef.id}_${userId}`), {
    group_id: docRef.id,
    user_id: userId,
    joined_at: serverTimestamp()
  })
  return docRef.id
}

export async function joinGroup(userId:string, groupId:string){
  await setDoc(doc(db,'group_members', `${groupId}_${userId}`), {
    group_id: groupId,
    user_id: userId,
    joined_at: serverTimestamp()
  })
}

// Sessions (simplified)
export async function startSession(userId:string, missionId:string, groupId?:string){
  const col = collection(db,'sessions')
  const docRef = await addDoc(col, {
    user_id: userId,
    group_id: groupId || null,
    mission_id: missionId,
    date: new Date().toISOString().slice(0,10),
    status: 'in_progress',
    started_at: serverTimestamp()
  })
  const sessionId = docRef.id

  // create session_steps from mission_steps
  try{
    const ms = await listMissionSteps(missionId)
    for(const m of ms){
      await addDoc(collection(db,'session_steps'), {
        session_id: sessionId,
        mission_step_id: m.id,
        label: (m as any).label || '',
        started_at: serverTimestamp(),
        finished_at: null,
        result: 'not_started',
        lap_ms: null,
        order: (m as any).order || 0
      })
    }
  }catch(e){
    // ignore
  }

  return sessionId
}

export async function finishSession(sessionId:string, finishedAt?:any){
  const ref = doc(db,'sessions',sessionId)
  await updateDoc(ref, { status:'completed', finished_at: finishedAt || serverTimestamp() })
}

export async function listTodaySessionsByGroup(groupId:string){
  const today = new Date().toISOString().slice(0,10)
  const q = query(collection(db,'sessions'), where('group_id','==',groupId), where('date','==',today))
  const snap = await getDocs(q)
  return snap.docs.map(d=>({ id:d.id, ...d.data() }))
}

export async function getGroup(groupId:string){
  const ref = doc(db,'groups',groupId)
  const snap = await getDoc(ref)
  return snap.exists() ? { id:snap.id, ...snap.data() } : null
}

export async function listGroupMembers(groupId:string){
  const q = query(collection(db,'group_members'), where('group_id','==',groupId))
  const snap = await getDocs(q)
  return snap.docs.map(d=>({ id:d.id, ...d.data() }))
}

// Finish session and compute group results (RACE/ALL)
export async function finishSessionAndCompute(sessionId:string){
  const sref = doc(db,'sessions',sessionId)
  const sSnap = await getDoc(sref)
  if(!sSnap.exists()) throw new Error('session not found')
  const sData:any = sSnap.data()
  const finishedAt = serverTimestamp()

  await updateDoc(sref, { status:'completed', finished_at: finishedAt })

  const groupId = sData.group_id
  const date = sData.date
  if(!groupId) return

  const group = await getGroup(groupId)
  if(!group) return

  if(group.mode === 'RACE'){
    // compute rank based on finished_at asc
    const q = query(collection(db,'sessions'), where('group_id','==',groupId), where('date','==',date), where('status','==','completed'), orderBy('finished_at','asc'))
    const snap = await getDocs(q)
    const ids = snap.docs.map(d=>d.id)
    const rank = ids.indexOf(sessionId) + 1
    if(rank>0){
      await updateDoc(sref, { rank })
    }
  }

  if(group.mode === 'ALL'){
    // check whether all members have a completed session today
    const members = await listGroupMembers(groupId)
    const memberIds = members.map(m=>m.user_id)
    const q = query(collection(db,'sessions'), where('group_id','==',groupId), where('date','==',date), where('status','==','completed'))
    const snap = await getDocs(q)
    const cleared = snap.docs.map(d=> (d.data() as any).user_id )

    const allCleared = memberIds.every(id=> cleared.includes(id))
    const gdsRef = doc(db,'group_daily_status', `${groupId}_${date}`)
    const prevSnap = await getDoc(gdsRef)
    let streak = 0
    if(allCleared){
      if(prevSnap.exists()){
        const prev = prevSnap.data() as any
        streak = (prev.clear_streak || 0) + 1
      }else{
        streak = 1
      }
      await setDoc(gdsRef, {
        group_id: groupId,
        date,
        all_cleared: true,
        cleared_members: cleared,
        last_clear_member: sData.user_id || null,
        clear_streak: streak
      })
    }else{
      await setDoc(gdsRef, {
        group_id: groupId,
        date,
        all_cleared: false,
        cleared_members: cleared,
        last_clear_member: sData.user_id || null,
        clear_streak: 0
      })
    }
  }
}

export async function getGroupDailyStatus(groupId:string, date?:string){
  const d = date || new Date().toISOString().slice(0,10)
  const ref = doc(db,'group_daily_status', `${groupId}_${d}`)
  const snap = await getDoc(ref)
  return snap.exists() ? { id:snap.id, ...snap.data() } : null
}

export { db }

export async function listTodaySessionsByUser(userId:string){
  const today = new Date().toISOString().slice(0,10)
  const q = query(collection(db,'sessions'), where('user_id','==',userId), where('date','==',today))
  const snap = await getDocs(q)
  return snap.docs.map(d=>({ id:d.id, ...d.data() }))
}

export async function listSessionSteps(sessionId:string){
  const q = query(collection(db,'session_steps'), where('session_id','==',sessionId), orderBy('order','asc'))
  const snap = await getDocs(q)
  return snap.docs.map(d=>({ id:d.id, ...d.data() }))
}

export async function completeSessionStep(sessionStepId:string){
  const ref = doc(db,'session_steps',sessionStepId)
  await updateDoc(ref, { finished_at: serverTimestamp(), result: 'success' })

  // After marking this step success, check if all steps for the session are completed.
  const snap = await getDoc(ref)
  if(!snap.exists()) return
  const sdata:any = snap.data()
  const sessionId = sdata.session_id
  if(!sessionId) return

  // find any remaining not-success steps
  const q = query(collection(db,'session_steps'), where('session_id','==',sessionId), where('result','!=','success'))
  const rem = await getDocs(q)
  if(rem.size === 0){
    // all steps completed -> finish session and compute group results
    try{
      await finishSessionAndCompute(sessionId)
    }catch(e){
      // ignore compute errors for now
    }
  }
}
