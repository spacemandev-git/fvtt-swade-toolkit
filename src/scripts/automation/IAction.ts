export interface SwadeAction{
  name: string,
  type: "skill" | "damage",
  skill?: string,
  damage?: string,
  skillMod?: string,
  dmgMod?:string,

  rof?: number, 
  shotsUsed?:number,
}

