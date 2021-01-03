var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class Handler {
    constructor() {
        this.registerSettings();
        this.startListeners();
    }
    static execOrderSort(a, b) {
        if (a.execOrderNum > b.execOrderNum) {
            return 1;
        }
        else if (a.execOrderNum < b.execOrderNum) {
            return -1;
        }
        return 0;
    }
    startListeners() {
        //SwadeActor, SwadeItem, ChatMessage objects
        Hooks.on("swadeChatCard", (actor, item, chatCard) => __awaiter(this, void 0, void 0, function* () {
            let transformers = game.settings.get("swade-toolkit", "transformers").ShowChatCard;
            // Transformers will be executed from lowest to highest order
            transformers = transformers.sort(Handler.execOrderSort);
            for (let transformer of transformers) {
                if (!transformer.isActive) {
                    continue;
                } //ignore disabled transformers
                let transformFunction = eval(transformer.transformer);
                let transformedResult = yield transformFunction(actor, item, chatCard);
                actor = transformedResult.actor;
                item = transformedResult.item,
                    chatCard = transformedResult.chatCard;
            }
        }));
        //SwadeActor, SwadeItem, ActionID, Roll Object
        Hooks.on("swadeChatCardAction", (actor, item, actionID, roll) => __awaiter(this, void 0, void 0, function* () {
            let transformers = game.settings.get("swade-toolkit", "transformers").ItemAction;
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
        game.settings.registerMenu("swade-toolkit", "handler-menu", {
            name: game.i18n.localize("SWADE_Handlers.Automation"),
            label: game.i18n.localize("SWADE_Handlers.Transformers_Button"),
            hint: game.i18n.localize("SWADE_Handlers.Transformers_Hint"),
            type: TransformerSettings,
            restricted: false,
        });
        /**
         * This is globally accessible storage for the list of transformer objects registered to this handler
         * They are organized by *trigger_name* which is often a *hook_name*, but in certain instances, might be different than the hook when the handler had to repackage it for whatever reason.
         */
        game.settings.register("swade-toolkit", "transformers", {
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
                console.log("SWADE Toolkit | Transformers Updated", value);
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
                if (!Handler.Triggers.includes(triggerName)) {
                    throw new Error(`Trigger ${triggerName} not found in list of triggers.`);
                }
                let transformers = game.settings.get("swade-toolkit", "transformers");
                if (transformers[triggerName].find(el => el.name == transformerObj.name) != undefined) {
                    //throw new Error(`Trigger ${transformerObj.name} already exists`)
                    return false;
                }
                transformers[triggerName].push(transformerObj);
                yield game.settings.set("swade-toolkit", "transformers", transformers);
                return true;
            }
            catch (e) {
                throw e;
            }
        });
    }
    /**
     * Just a wrapper that deals with register/remove in a combined call
     * @param triggerName
     * @param transformerObj
     */
    updateTransformer(triggerName, transformerObj) {
        return __awaiter(this, void 0, void 0, function* () {
            this.removeTransformer(triggerName, transformerObj.name);
            this.registerTransformer(triggerName, transformerObj);
        });
    }
    /**
     * Removes a registered transformer from the trigger list
     * @param triggerName
     * @param transformerName
     */
    removeTransformer(triggerName, transformerName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!Handler.Triggers.includes(triggerName)) {
                    throw new Error(`Trigger ${triggerName} not found in list of triggers.`);
                }
                let transformers = game.settings.get("swade-toolkit", "transformers");
                if (transformers[triggerName].find(el => el.name == transformerName) == undefined) {
                    return true;
                }
                else {
                    transformers[triggerName] = transformers[triggerName].filter(el => el.name != transformerName);
                }
                yield game.settings.set("swade-toolkit", "transformers", transformers);
                return true;
            }
            catch (e) {
                throw e;
            }
        });
    }
    /**
     * Returns a version of the transformers object, with only the transformers that are apply to the passed entity ID
     * @param entityID The ID of the entity you want to fetch the transformers for
     */
    getTransformerByEntityId(entityID) {
        let transformers = game.settings.get("swade-toolkit", "transformers");
        let entityTransformers = {};
        for (let triggerName of Object.keys(transformers)) {
            entityTransformers[triggerName] = transformers[triggerName].filter((el) => el.entityID == entityID).sort(Handler.execOrderSort);
        }
        return entityTransformers;
    }
}
/**
 * This is a list of triggers that the Action Handler listens for
 * It doesn't correspond 1:1 with the name of the hooks because the Handler repackages hooks to better suit these triggers
 * Sometimes various hooks trigger the same Trigger, or there might not be an exact hook that accomplishes what needs to happen.
 *
 * When updating this list, ALSO update the DEFAULTS for the Transformers DB
 */
Handler.Triggers = ["TraitRoll", "ShowChatCard", "ItemAction"];
export class TransformerSettings extends FormApplication {
    constructor(obj, opts = {}) {
        super(obj, opts);
    }
    getData() {
        return {};
    }
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "swade-toolkit-transformer-settings",
            title: game.i18n.localize("SWADE_Handlers.Automation"),
            template: 'modules/swade-toolkit/templates/TransformerSettings.hbs'
        });
    }
    activateListeners(html) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
}
