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
    game.settings.register("swade-toolkit", "wound-status-effects", {
      name: game.i18n.localize("Status_Effects.Wound_Status_Effects"),
      scope: "world",
      config: true,
      type: Boolean,
      default: false,
    })
  }

  private set_level_effects(type, id) {
        let target = type == 'token' ? canvas.tokens.get(id) : ''
        for (let i = 1; i < 7; i++) {
            if (i <= 2) {
                // Fatigue
                target.toggleEffect(`modules/swade-toolkit/assets/icons/f${i}.png`,
                    {active: i === target.actor.data.data.fatigue.value, overlay: false });
            }
        }
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


    //Hack: Add a listener onto the status icons that calls the actor update on the sheet
    Hooks.on("renderTokenHUD", (tokenHUD: TokenHUD, html:JQuery<HTMLElement>, opts:any) => {
      let token = canvas.tokens.get(opts._id);
      if(!token.owner){return;} //only process for the token owner
      html.find(".effect-control").on("click", async (evt) => {
        evt.preventDefault();
        let status = evt.target.title;
        if(!coreStatusList.includes(status)){return;} //we only care about core statuses
        let tokenEffects = token.actor['effects'];
        if(!token.actor.data.data.status[`is${status}`] && !tokenEffects.find(el => el.data.label == status)){
          //status is FALSE on actor AND it doesn't currently exist 
          await token.actor.update({
            [`data.status.is${status}`]: true
          });

          //Unfortunately because foundry AND this handler made a status we need to do some clean up and delete the second one
          setTimeout(()=>{
            token = canvas.tokens.get(opts._id);
            let tokenStatuses = token.actor['effects'].filter(el => el.data.label == status);
            if(tokenStatuses.length > 1){
              token.actor.deleteEmbeddedEntity("ActiveEffect", tokenStatuses[0].id);
            }
          }, 250)
        } else {
          token.actor.update({
            [`data.status.is${status}`]: false
          })
        }
      })
    })

    //Status Linking for NPCs
    Hooks.on("updateToken", (scene:Scene, tokenDiff, data, diff, userId) => {
      if(!game.userId == userId || !diff.diff){return;} //diff is used to stop propagation after the first sync
        if (game.settings.get("swade-toolkit", "wound-status-effects")) {
            if (data?.actorData?.data?.fatigue) {
                this.set_level_effects('token', tokenDiff._id);
            }
        }
      //sync the sheet and token
      //CAN ONLY DO ONE WAY BINDING
      // Always do Sheet to Token
      // Create a separate listener on tokenHUD that updates sheet when token status is clicked
      if(!tokenDiff.actorLink){
        let token:Token = canvas.tokens.get(tokenDiff._id);
        let obj = data.actorData?.data?.status;
        if(!obj){return;} //only care if status object is updated
        let tokenEffects = token.actor['effects']

        for(let status of coreStatusList){
          if(obj[`is${status}`] == true && !tokenEffects.find(el => el.data.label == status)){
            //it's turned to true AND the status doesn't currently exist on the token
            token.actor.createEmbeddedEntity('ActiveEffect', {
              label: status,
              icon: `systems/swade/assets/icons/status/status_${status.toLowerCase()}.svg`,
              flags: {
                core: {
                  statusId: status.toLowerCase()
                }
              } 
            })
          } else if (obj[`is${status}`] == false && tokenEffects.find(el => el.data.label == status)){
            //it's turned off AND there is currently a token effect
            let effectToDelete = tokenEffects.find(el => el.data.label == status).id
            token.actor.deleteEmbeddedEntity("ActiveEffect", effectToDelete);
          }
        }
      }
      /*
        if(!tokenDiff.actorLink){
          let token:Token = canvas.tokens.get(tokenDiff._id);
      
          let effects = tokenDiff.actorData?.effects;
          /**
           * CAN ONLY DO ONE WAY BINDING CURRENTLY
           * Token > Sheet or Sheet > Token (doing both causes infinite loop)
           * Token > Sheet is preferred because NPCs are quick toggles and you're using the token for them.
           */
          /*
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
      */
    })

    //Status Linking for Wildcards
    Hooks.on("createActiveEffect", (actor:Actor, activeEffect:any, opts:any, userId) => {
      if(game.userId != userId){return;}

      for(let status of coreStatusList){
        if(activeEffect.label == status && !actor.data.data.status[`is${status}`]){
          //If the status is the active effect AND it's not currently ON
          actor.update({
            [`data.status.is${status}`]: true
          })
        }
      }
    })

    Hooks.on("deleteActiveEffect", (actor:Actor, activeEffect:any, opts:any, userId) => {
      if(game.userId != userId){return;}
      
      for(let status of coreStatusList){
        if(activeEffect.label == status && actor.data.data.status[`is${status}`]){
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