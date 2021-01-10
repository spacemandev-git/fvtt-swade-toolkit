import {Handler } from './Handler.js'
import { SwadeAction } from './IAction.js';
import {TransformerLibrary} from './TransformerLibrary.js'
Hooks.on("ready", () => {
  //Register Automation Handler
  game.automation = new Handler();
  game.automation.library = new TransformerLibrary(); 
  game.automation.util = new Utility();
})

/**
 * @param token is of type *any* because it's the token data, not the token itself
 */
Hooks.on("deleteToken", async (scene:Scene, token:Token['data'], obj:any, userId: string) => {
  if(game.userId != userId){return;} //only process this on the machine that made the token
  //Delete all the transformers related to this token
  let eTransformers = game.automation.getTransformersByEntityId('Token', token.id, false);
  for(let key of Object.keys(eTransformers)){
    for(let transformer of eTransformers[key]){
      await game.automation.removeTransformer(transformer.trigger, transformer.name);
    }
  }
})

Hooks.on("deleteActor", async (actor:Actor, obj:any, userId: string) => {
  if(game.userId != userId){return;} //only process this on the machine that made the token
  //Delete all the transformers related to this token
  let eTransformers = game.automation.getTransformersByEntityId('Actor', actor.id, false);
  for(let key of Object.keys(eTransformers)){
    for(let transformer of eTransformers[key]){
      await game.automation.removeTransformer(transformer.trigger, transformer.name);
    }
  }
})

//Meant to contain helper functions to be found in game.automation.util
class Utility {
  public getSwadeAction(item:Item, actionId:string){
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
        skillMod: item.data.data.actions.skillMod,
        shotsUsed: 0
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
          skillMod: (parseNumber(item.data.data.actions.skillMod) + parseNumber(itemAction.skillMod)).toString(),
          shotsUsed: itemAction.shotsUsed
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

    /**
   * Default roll flavor text
   * @param actor 
   * @param item 
   * @param actionID 
   * @param roll 
   */
  public getFlavor = (actor:Actor, item:Item, actionID:string, roll:Roll) => {
    let flavor = ''
    let action:SwadeAction = game.automation.util.getSwadeAction(item, actionID);
  
    if(action.type == "skill"){
      let skillItem = actor.items.find(el => el.name == action.skill);
      if(skillItem){
        let coreSkillFormula = skillItem.data.data.die.modifier != "" ? `1d${skillItem.data.data.die.sides} +${skillItem.data.data.die.modifier}` : `1d${skillItem.data.data.die.sides}`
        flavor = `${item.data.data.actions.skill} (${coreSkillFormula}) ${game.i18n.localize('SWADE.SkillTest')}`
      } else {
        flavor = `${game.i18n.localize("SWADE.Unskilled")} (1d4-2) ${game.i18n.localize('SWADE.SkillTest')}`
      }
    } else {
      let ap = getProperty(item.data, 'data.ap') ? `(${game.i18n.localize('SWADE.Ap')} ${getProperty(item.data, 'data.ap')})` : `(${game.i18n.localize('SWADE.Ap')} 0)`
      flavor = `${item.name} ${game.i18n.localize("SWADE.Dmg")} (${item.data.data.damage}) ${ap}`
    }
  
    flavor += "<br>"
    for(let modifier of roll['modifiers']){
      flavor += `${modifier.description} : ${modifier.value}`
      flavor += "<br>"
    }
    return flavor;
  }
}