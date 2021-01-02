var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as Handlers from './Handlers.js';
export class ActionHandler {
    constructor() {
        this.registerSettings();
        this.startListeners();
    }
    startListeners() {
        //SwadeActor, SwadeItem, ChatMessage objects
        Hooks.on("swadeChatCard", (actor, item, chatCard) => __awaiter(this, void 0, void 0, function* () {
            let transformers = game.settings.get("swade-toolkit", "action-handler-transformers").ShowChatCard;
            for (let transformer of transformers) {
                let transformFunction = eval(transformer.transformer);
                let transformedResult = yield transformFunction(actor, item, chatCard);
                actor = transformedResult.actor;
                item = transformedResult.item,
                    chatCard = transformedResult.chatCard;
            }
        }));
        //SwadeActor, SwadeItem, ActionID, Roll Object
        Hooks.on("swadeChatCardAction", (actor, item, actionID, roll) => __awaiter(this, void 0, void 0, function* () {
            let transformers = game.settings.get("swade-toolkit", "action-handler-transformers").ItemAction;
            for (let transformer of transformers) {
                let transformFunction = eval(transformer.transformer);
                let transformedResult = yield transformFunction(actor, item, actionID, roll);
                actor = transformedResult.actor;
                item = transformedResult.item,
                    actionID = transformedResult.chatCard,
                    roll = transformedResult.roll;
            }
        }));
        //TODO: TraitRoll
    }
    registerSettings() {
        /*
          This menu should show a list of all active transformers for a given Handler
          Transformers can be "disabled" or "deleted"
          "Disabled" is important because of transformers that get loaded on reload, as deleting them would just recreate them on reload
          "Deleting" will work when it's a Transformer that's been added as a user action
    
        */
        game.settings.registerMenu("swade-toolkit", "action-handler-menu", {
            name: game.i18n.localize("SWADE_Handlers.Automation"),
            label: game.i18n.localize("SWADE_Handlers.Transformers_Button"),
            hint: game.i18n.localize("SWADE_Handlers.Transformers_Hint"),
            type: Handlers.TransformerSettings,
            restricted: false,
        });
        /**
         * This is globally accessible storage for the list of transformer objects registered to this handler
         * They are organized by *trigger_name* which is often a *hook_name*, but in certain instances, might be different than the hook when the handler had to repackage it for whatever reason.
         */
        game.settings.register("swade-toolkit", "action-handler-transformers", {
            name: "DB for Transformer Objects for the Handler",
            scope: "world",
            config: false,
            type: Object,
            default: {
                //SHOULD MIRROR WHATEVER ACTIONHANDLERS.ACTIONTRIGGERS list
                "TraitRoll": [],
                "ShowChatCard": [],
                "ItemAction": []
            },
            onChange: (value) => {
                console.log("SWADE Toolkit | Action Handler Transformers Updated", value);
            }
        });
    }
    /**
     *
     * Registers a new transformer object on a given trigger for the handler
     * Transformers must have a unique name else will be rejected
     * @param triggerName String, must be in the list of approved triggers for this handler
     * @param transformerObj Handler Object, see Handler Interface for more details
     */
    registerTransformer(triggerName, transformerObj) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!ActionHandler.ActionTriggers.includes(triggerName)) {
                    throw new Error(`Trigger ${triggerName} not found in Handler list of triggers.`);
                }
                let transformers = game.settings.get("swade-toolkit", "action-handler-transformers");
                if (transformers[triggerName].find(el => el.name == transformerObj.name) != undefined) {
                    //throw new Error(`Trigger ${transformerObj.name} already exists`)
                    return false;
                }
                transformers[triggerName].push(transformerObj);
                yield game.settings.set("swade-toolkit", "action-handler-transformers", transformers);
                return true;
            }
            catch (e) {
                throw e;
            }
        });
    }
    removeTransformer(triggerName, transformerName) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
}
//Generic Handler Object
//Register a setting for switching this Handler on/off
//Register a setting for list of transformers
//Register a form app that lets you enable/disable/remove transformers (or clear All) for a given entity
//SHOULD NOT MAINTAIN STATE OUTSIDE OF SETTINGS! 
/**
 * This is a list of triggers that the Action Handler listens for
 * It doesn't correspond 1:1 with the name of the hooks because the Handler repackages hooks to better suit these triggers
 * Sometimes various hooks trigger the same Trigger, or there might not be an exact hook that accomplishes what needs to happen.
 *
 * When updating this list, ALSO update the DEFAULTS for the Transformers DB
 */
ActionHandler.ActionTriggers = ["TraitRoll", "ShowChatCard", "ItemAction"];
