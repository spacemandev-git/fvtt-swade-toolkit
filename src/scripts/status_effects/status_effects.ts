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

    //Status Linking
    Hooks.on("updateToken", (scene:Scene, tokenDiff, data, diff, userId) => {
      if(!game.userId == userId || !diff.diff){return;} //diff is used to stop propagation after the first sync
      //sync the sheet and token
      if(!tokenDiff.actorLink){
        let token:Token = canvas.tokens.get(tokenDiff._id);
        let coreStatusList = [
          'Shaken',
          'Distracted',
          'Vulnerable',
          'Stunned',
          'Entangled',
          'Bound',
        ];      
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
  }
}