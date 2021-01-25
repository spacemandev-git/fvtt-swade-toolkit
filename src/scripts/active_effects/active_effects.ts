Hooks.on("ready", () => {
  game.toolkit = {
    activeEffects: new ActiveEffects()
  }
})

class ActiveEffects{
  constructor(){
    this.registerSettings();
    this.startSkillModListeners();
  }

  private registerSettings(){
    game.settings.register("swade-toolkit", "enableSkillsActiveEffects", {
      name: game.i18n.localize("Active_Effects.Enable_Skill_Active_Effects"),
      scope: "world",
      config: true,
      type: Boolean,
      default: false,
    })
  }

  private startSkillModListeners(){
    const addEffect = async (actor:Actor, effect:any, opts:any, userId:string) => {
      if(game.userId != userId || !game.settings.get("swade-toolkit", "enableSkillsActiveEffects")){return;}
      if(!effect.changes.find(el => (el.key.includes("d!") || el.key.includes("m!")))){return;} //only process the AEs with d! and m!

      let effectedSkills = []

      for(let change of effect.changes){
        if(change.key.startsWith("d!")){
          if(change.value % 2 != 0){
            ui.notifications.error(game.i18n.localize("Active_Effects.Die_Must_Be_Even"));
            return;
          }
          let skillName = change.key.split("d!")[1]
          let skill = actor.items.find(el => el.name == skillName);
          if(!skill){continue;}//no skill found
          if(!skill.getFlag("swade-toolkit", "active-effects")){
            await skill.setFlag("swade-toolkit", "active-effects", [])
          }
          if(!skill.getFlag("swade-toolkit","active-effects").includes(effect._id)){ //if effect isn't already on this skill
            //AE Turned On
            let skillIdx = effectedSkills.findIndex(el => el.name == skillName);
            if(skillIdx == -1){
              effectedSkills.push(duplicate(skill));
              skillIdx = effectedSkills.length - 1;
            }
            effectedSkills[skillIdx].data.die.sides += change.value;
          }
        } else if (change.key.startsWith("m!")){
          let skillName = change.key.split("m!")[1]
          let skill = actor.items.find(el => el.name == skillName);
          if(!skill){continue;}//no skill found
          if(!skill.getFlag("swade-toolkit", "active-effects")){
            await skill.setFlag("swade-toolkit", "active-effects", [])
          }
          if(!skill.getFlag("swade-toolkit","active-effects").includes(effect._id)){ //if effect isn't already on this skill
            //AE Turned On
            let skillIdx = effectedSkills.findIndex(el => el.name == skillName);
            if(skillIdx == -1){
              effectedSkills.push(duplicate(skill));
              skillIdx = effectedSkills.length - 1;
            }
            let mod = skill.data.data.die.modifier === "" ? 0 : parseInt(skill.data.data.die.modifier)
            effectedSkills[skillIdx].data.die.modifier = (mod + change.value).toString();
          }
        }
      } 

      for(let updatedSkill of effectedSkills){
        //add the effect as "on" on the the skill
        updatedSkill.flags['swade-toolkit']['active-effects'] = updatedSkill.flags['swade-toolkit']['active-effects'].concat([effect._id]);
        await actor.deleteOwnedItem(updatedSkill._id);
        actor.createOwnedItem(updatedSkill, {renderSheet:false});
      }
    }

    const deleteEffect = async (actor:Actor, effect:any, opts:any, userId:string) => {
      //item was deleted
      if(game.userId != userId || !game.settings.get("swade-toolkit", "enableSkillsActiveEffects")){return;}
      if(!effect.changes.find(el => (el.key.includes("d!") || el.key.includes("m!")))){return;} //only process the AEs with d! and m!

      let effectedSkills = [];
      for(let change of effect.changes){
        if(change.key.startsWith("d!")){
          let skillName = change.key.split("d!")[1]
          let skill = actor.items.find(el => el.name == skillName);
          if(!skill){continue;}//no skill found

          if(skill.getFlag("swade-toolkit","active-effects").includes(effect._id)){
            //if the skill includes this AE
            //AE Turned Off
            let skillIdx = effectedSkills.findIndex(el => el.name == skillName);
            if(skillIdx == -1){
              effectedSkills.push(duplicate(skill));
              skillIdx = effectedSkills.length - 1;
            }
            effectedSkills[skillIdx].data.die.sides -= change.value;
          }
        } else if (change.key.startsWith("m!")){
          let skillName = change.key.split("m!")[1]
          let skill = actor.items.find(el => el.name == skillName);
          if(!skill){continue;}//no skill found
          if(!skill.getFlag("swade-toolkit", "active-effects")){
            await skill.setFlag("swade-toolkit", "active-effects", [])
          }
          if(skill.getFlag("swade-toolkit","active-effects").includes(effect._id)){ 
            //if the effect is on the skill
            //AE Turned Off
            let skillIdx = effectedSkills.findIndex(el => el.name == skillName);
            if(skillIdx == -1){
              effectedSkills.push(duplicate(skill));
              skillIdx = effectedSkills.length - 1;
            }
            let mod = skill.data.data.die.modifier === "" ? 0 : parseInt(skill.data.data.die.modifier)
            effectedSkills[skillIdx].data.die.modifier = (mod - change.value).toString();          }
        }
      } 

      for(let updatedSkill of effectedSkills){
        //update the updated skill to remove the effect flag
        updatedSkill.flags['swade-toolkit']['active-effects'] = updatedSkill.flags['swade-toolkit']['active-effects'].filter(el => el != effect._id)
        await actor.deleteOwnedItem(updatedSkill._id);
        actor.createOwnedItem(updatedSkill, {renderSheet:false});
      }
      
    }


    // Need to also do it on createActiveEffect hook so item active effects get triggered
    Hooks.on("createActiveEffect", async (actor: Actor, effect: any, opts:any, userId:string) => {
      await addEffect(actor, effect, opts, userId)
    })

    Hooks.on("deleteActiveEffect", async (actor:Actor, effect: any, opts: any, userId:string) => {
      await deleteEffect(actor, effect, opts, userId);
    })

    Hooks.on("updateActiveEffect", async (actor:Actor, effect:any, opts: any, diff: any, userId:string) => {
      if(opts.disabled){
        await deleteEffect(actor, effect, opts, userId);
      } else {
        await addEffect(actor, effect, opts, userId);
      }
    })
  }
}