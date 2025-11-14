import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, doc, setDoc, getDocs, query, where, orderBy, updateDoc, serverTimestamp } from 'firebase/firestore'

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
  return docRef.id
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
