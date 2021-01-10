//register settings
Hooks.on("ready", () => {
    game.toolkit = {
        statuseffects: new StatusEffects()
    }; //game.toolkit.statuseffects
});
class StatusEffects {
    constructor() {
        this.registerSettings();
        this.startStatusLinkingListeners();
    }
    registerSettings() {
        game.settings.register("swade-toolkit", "link-status-effects", {
            name: game.i18n.localize("Status_Effects.Link_Status_Effects"),
            scope: "world",
            config: true,
            type: Boolean,
            default: false,
        });
    }
    startStatusLinkingListeners() {
        if (!game.settings.get("swade-toolkit", "link-status-effects")) {
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
        Hooks.on("updateToken", (scene, tokenDiff, data, diff, userId) => {
            var _a, _b;
            if (!game.userId == userId || !diff.diff) {
                return;
            } //diff is used to stop propagation after the first sync
            //sync the sheet and token
            //CAN ONLY DO ONE WAY BINDING
            // Always do Sheet to Token
            // Create a separate listener on tokenHUD that updates sheet when token status is clicked
            if (!tokenDiff.actorLink) {
                let token = canvas.tokens.get(tokenDiff._id);
                let obj = (_b = (_a = data.actorData) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.status;
                if (!obj) {
                    return;
                } //only care if status object is updated
                let tokenEffects = token.actor['effects'];
                console.debug("Token Effects", tokenEffects);
                for (let status of coreStatusList) {
                    if (obj[`is${status}`] == true && !tokenEffects.find(el => el.data.label == status)) {
                        //it's turned to true AND the status doesn't currently exist on the token
                        token.actor.createEmbeddedEntity('ActiveEffect', {
                            label: status,
                            icon: `systems/swade/assets/icons/status/status_${status.toLowerCase()}.svg`,
                            flags: {
                                core: {
                                    statusId: status.toLowerCase()
                                }
                            }
                        });
                    }
                    else if (obj[`is${status}`] == false && tokenEffects.find(el => el.data.label == status)) {
                        console.debug("Trying to delete the effect");
                        //it's turned off AND there is currently a token effect
                        console.debug("Token Effects: ", tokenEffects);
                        let effectToDelete = tokenEffects.find(el => el.data.label == status).id;
                        console.debug("effect to delete", effectToDelete);
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
        });
        //Status Linking for Wildcards
        Hooks.on("createActiveEffect", (actor, activeEffect, opts, userId) => {
            if (game.userId != userId) {
                return;
            }
            for (let status of coreStatusList) {
                if (activeEffect.label == status && !actor.data.data.status[`is${status}`]) {
                    actor.update({
                        [`data.status.is${status}`]: true
                    });
                }
            }
        });
        Hooks.on("deleteActiveEffect", (actor, activeEffect, opts, userId) => {
            if (game.userId != userId) {
                return;
            }
            for (let status of coreStatusList) {
                if (activeEffect.label == status && actor.data.data.status[`is${status}`]) {
                    actor.update({
                        [`data.status.is${status}`]: false
                    });
                }
            }
        });
        // Sheet was changed so make a AE, which will trigger the above hook and make a token 
        Hooks.on("updateActor", (actor, change, opts, userId) => {
            var _a;
            if (game.userId != userId && opts.diff) {
                return;
            }
            if ((_a = change.data) === null || _a === void 0 ? void 0 : _a.status) {
                for (let status of coreStatusList) {
                    if (change.data.status[`is${status}`]) {
                        //status was changed to true
                        //create active effect
                        if (!actor['effects'].find(el => el.data.label == status)) {
                            //only create it once, if it's already there, no need to create it again
                            actor.createEmbeddedEntity('ActiveEffect', {
                                label: status,
                                icon: `systems/swade/assets/icons/status/status_${status.toLowerCase()}.svg`,
                                flags: {
                                    core: {
                                        statusId: status.toLowerCase()
                                    }
                                }
                            });
                        }
                    }
                    else if (change.data.status[`is${status}`] == false) { //specifically want false and not undefined so it's acted only when changed
                        //status was changed to false
                        //delete active effect
                        let effectToDelete = actor['effects'].find(el => el.data.label == status);
                        if (effectToDelete) {
                            actor.deleteEmbeddedEntity("ActiveEffect", effectToDelete.id);
                        }
                    }
                }
            }
        });
    }
}
