//register settings
Hooks.on("ready", () => {
  game.toolkit = {
    statuseffects: new StatusEffects()
  }//game.toolkit.statuseffects
})

class StatusEffects {
  constructor(){
    this.registerSettings();
    this.startStatusLinkingListeners();
  }

  private registerSettings(){
    game.settings.register("swade-toolkit", "link-status-effects", {
      name: game.i18n.localize("Status_Effects.Link_Status_Effects"),
      scope: "world",
      config: true,
      type: Boolean,
      default: false,
    })
  }

  private startStatusLinkingListeners(){
    if(!game.settings.get("swade-toolkit", "link-status-effects")){
      return; //don't do anything if the setting isn't turned on
    }

    let coreStatusList = [
      'Shaken',
      'Distracted',
      'Vulnerable',
      'Stunned',
      'Entangled',
      'Bound',
    ]; 

    //Status Linking for NPCs
    Hooks.on("updateToken", (scene:Scene, tokenDiff, data, diff, userId) => {
      if(!game.userId == userId || !diff.diff){return;} //diff is used to stop propagation after the first sync
      //sync the sheet and token
      if(!tokenDiff.actorLink){
        let token:Token = canvas.tokens.get(tokenDiff._id);
     
        let effects = tokenDiff.actorData?.effects;
        /**
         * CAN ONLY DO ONE WAY BINDING CURRENTLY
         * Token > Sheet or Sheet > Token (doing both causes infinite loop)
         * Token > Sheet is preferred because NPCs are quick toggles and you're using the token for them.
         */

        if(effects){
          //the status effect was applied on the token
          //source of truth then is the tokendiff.effects
          //we have to apply it to the actorData  
          for(let status of coreStatusList){
            if(effects.find(effect => effect.label == status)){
              //status is on the token, so make sure it's "true" on the actordata
              token.actor.update({
                [`data.status.is${status}`]: true
              })
            } else {
              //status was REMOVED from the token so make sure it's off the actor
              token.actor.update({
                [`data.status.is${status}`]: false 
              })
            }
          }
        }
      }
    })

    //Status Linking for Wildcards
    Hooks.on("createActiveEffect", (actor:Actor, activeEffect:any, opts:any, userId) => {
      if(game.userId != userId){return;}
      
      for(let status of coreStatusList){
        if(activeEffect.label == status){
          actor.update({
            [`data.status.is${status}`]: true
          })
        }
      }
    })

    Hooks.on("deleteActiveEffect", (actor:Actor, activeEffect:any, opts:any, userId) => {
      if(game.userId != userId){return;}
      
      for(let status of coreStatusList){
        if(activeEffect.label == status){
          actor.update({
            [`data.status.is${status}`]: false
          })
        }
      }
    })

    // Sheet was changed so make a AE, which will trigger the above hook and make a token 
    Hooks.on("updateActor", (actor:Actor, change:any, opts:any, userId) => {
      if(game.userId != userId && opts.diff){return;}
      if(change.data?.status){
        for(let status of coreStatusList){
          if(change.data.status[`is${status}`]){
            //status was changed to true
            //create active effect
            if(!actor['effects'].find(el=>el.data.label == status)){
              //only create it once, if it's already there, no need to create it again
              actor.createEmbeddedEntity('ActiveEffect', {
                label: status,
                icon: `systems/swade/assets/icons/status/status_${status.toLowerCase()}.svg`,
                flags: {
                  core: {
                    statusId: status.toLowerCase()
                  }
                } 
              })  
            }
          } else if (change.data.status[`is${status}`] == false){ //specifically want false and not undefined so it's acted only when changed
            //status was changed to false
            //delete active effect
            let effectToDelete = actor['effects'].find(el=>el.data.label == status)
            if(effectToDelete){
              actor.deleteEmbeddedEntity("ActiveEffect", effectToDelete.id);
            }
          }
        }
      }
    })
  }
}