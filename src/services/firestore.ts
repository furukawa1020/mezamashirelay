import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, doc, setDoc, getDocs, query, where, orderBy, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore'

// 同じ Firebase コンフィグを使う（auth と合わせてください）
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
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
}
