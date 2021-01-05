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

export function getSwadeAction(item:Item, actionId:string){
  let action:SwadeAction = undefined;

  const parseNumber = (numString: string) => {
    if(numString == "") {return 0}
    else{return parseInt(numString)}
  }

  if(actionId == "formula"){
    action = {
      name: "Base Skill Roll",
      type: "skill",
      skill: item.data.data.actions.skill,
      skillMod: item.data.data.actions.skillMod
    }
  } else if(actionId == "damage") {
    action = {
      name: "Base Damage Roll",
      type: "damage",
      damage: item.data.data.damage,
      dmgMod: parseNumber(item.data.data.actions.dmgMod).toString()      
    }
  } else {
    let itemAction = item.data.data.actions.additional[actionId]
    if(itemAction.type == "skill"){
      action = {
        name: itemAction.name,
        type: "skill",
        skill: itemAction.skillOverride != "" ? itemAction.skillOverride : item.data.data.actions.skill,
        skillMod: (parseNumber(item.data.data.actions.skillMod) + parseNumber(itemAction.skillMod)).toString()
      }
    } else if (itemAction.type == "damage"){
      action = {
        name: itemAction.name,
        type: "damage",
        damage: item.data.data.damage,
        dmgMod: (parseNumber(item.data.data.actions.dmgMod) + parseNumber(itemAction.dmgMod)).toString()      
      }
    }
  }
  return action;
}