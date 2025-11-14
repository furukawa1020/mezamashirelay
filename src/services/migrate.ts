import * as local from './localStore'
import * as fs from './firestore'

// Migrate localStore data to Firestore (when Firebase enabled). This will create
// missions, steps, groups and memberships. Sessions are not migrated automatically to avoid duplicates.
export async function migrateLocalToCloud(userId:string){
  if(!(import.meta.env.VITE_USE_FIREBASE === '1')) throw new Error('Firebase disabled')

  const data:any = local.exportAll()

  // Map local mission ids to new cloud ids
  const missionMap:Record<string,string> = {}
  for(const m of (data.missions||[])){
    const newId = await fs.createMission(userId, { name: m.name || 'mission', wake_time: m.wake_time || '07:00' })
    missionMap[m.id] = newId
    // migrate steps for this mission
    const steps = (data.mission_steps||[]).filter((s:any)=>s.mission_id===m.id)
    for(const s of steps){
      await fs.createMissionStep(newId, { label: s.label||'', order: s.order||0, type: s.type||'manual' })
    }
  }

  // Migrate groups and members
  const groupMap:Record<string,string> = {}
  for(const g of (data.groups||[])){
    const newG = await fs.createGroup(userId, g.name||'group', g.mode||'ALL')
    groupMap[g.id] = newG
  }
  for(const gm of (data.group_members||[])){
    const mapped = groupMap[gm.group_id]
    if(mapped){ await fs.joinGroup(gm.user_id || userId, mapped) }
  }

  return { missions:Object.keys(missionMap).length, groups:Object.keys(groupMap).length }
}

export default migrateLocalToCloud
