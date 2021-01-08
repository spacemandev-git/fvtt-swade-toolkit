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
        /**
         * This is a list of triggers that the Action Handler listens for
         * It doesn't correspond 1:1 with the name of the hooks because the Handler repackages hooks to better suit these triggers
         * Sometimes various hooks trigger the same Trigger, or there might not be an exact hook that accomplishes what needs to happen.
         *
         */
        this.Triggers = ["ItemAction"];
        this.getDefaultObject = () => {
            let obj = {};
            this.Triggers.forEach(t => {
                obj[t] = [];
            });
            return obj;
        };
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
        if (game.settings.get("swade-toolkit", "automation") == false) {
            return;
        } // don't start listeners if there's automation isn't on.
        Hooks.on("swadeAction", (actor, item, actionID, roll, userId) => __awaiter(this, void 0, void 0, function* () {
            console.log("Called swadeAction:", actor, item, actionID, roll, userId);
            if (!actor.owner || !roll) {
                //Only process the hook on the machine that the owns the Actor
                //don't process if roll is null (user canceled action)
                return;
            }
            //suppress the Chat Message that was just created by the user that did the action
            Hooks.once("createChatMessage", (chatMessage, opts, userId) => {
                if (userId == game.userId) {
                    chatMessage.delete();
                }
            });
            //We're going to abuse the roll object here a little bit by stuffing a "modifiers" list in there
            //Ideally every transformer will append this list to include the modifiers they added and the description of them
            roll['modifiers'] = [];
            roll['chatMessage'] = undefined;
            let transformers = this.getTransformersByEntityId("Actor", actor.id)['ItemAction'];
            yield this.processTransformers(transformers, { actor: actor, item: item, actionID: actionID, roll: roll, userId: userId, token: undefined, haltExecution: false });
            let actorTokens = canvas.tokens.placeables.filter((token) => token.actor.id == actor.id);
            if (actorTokens.length == 0) {
                //There are no tokens
                return;
            }
            // After Actor Transformers are done pass to Token Transformers
            for (let token of actorTokens) {
                // If the same transformer (like Ammo Counter) is registered for two tokens of the same actor, there's no way to differentiate when they should fire
                // As such, the transformer should only fire for the _currently selected token_ which can be fetched in the transformer by canavs.tokens.controlled[0]
                console.log(`SWADE Toolkit | Processing Token: ${token.name}`);
                let transformers = this.getTransformersByEntityId("Token", token.id)['ItemAction'];
                yield this.processTransformers(transformers, { actor: actor, item: item, actionID: actionID, roll: roll, userId: userId, token: token, haltExecution: false });
            }
        }));
    }
    processTransformers(transformers, args) {
        return __awaiter(this, void 0, void 0, function* () {
            let haltExecution = false;
            for (let transformer of transformers) {
                args.transformer = transformer;
                if (haltExecution) {
                    return;
                }
                let transformFunction = eval(transformer.transformer);
                let mutation = yield transformFunction(args);
                for (let key of Object.keys(mutation)) {
                    args[key] = mutation[key];
                    haltExecution = mutation['haltExecution'];
                }
            }
        });
    }
    registerSettings() {
        /**
         * This is globally accessible storage for the list of transformer objects registered to this handler
         * They are organized by *trigger_name* which is often a *hook_name*, but in certain instances, might be different than the hook when the handler had to repackage it for whatever reason.
         */
        game.settings.register("swade-toolkit", "transformers", {
            name: "DB for Transformer Objects for the Handler",
            scope: "world",
            config: false,
            type: Object,
            default: this.getDefaultObject(),
            onChange: (value) => {
                console.log("SWADE Toolkit | Transformers Updated", value);
            }
        });
        game.settings.register('swade-toolkit', 'automation', {
            name: JSON.stringify(game.i18n.localize("Automation.Automation_Text")).replace("\"", ""),
            hint: game.i18n.localize("Automation.Automation_Setting_Hint"),
            scope: "world",
            config: true,
            type: Boolean,
            default: false,
            onChange: (value) => {
                console.log("SWADE Toolkit | Automation:", value);
            }
        });
    }
    get transformers() {
        return game.settings.get("swade-toolkit", "transformers");
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
                if (!this.Triggers.includes(triggerName)) {
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
                if (!this.Triggers.includes(triggerName)) {
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
    resetTransformers() {
        return __awaiter(this, void 0, void 0, function* () {
            yield game.settings.set("swade-toolkit", "transformers", this.getDefaultObject());
        });
    }
    /**
     * Returns a version of the transformers object, with only the transformers that are apply to the passed entity ID
     * Returns not just the transformers for that entity but also any wild card transformers.
     * @param entityType The type of the entity to filter for
     * @param entityID The ID of the entity you want to fetch the transformers for
     */
    getTransformersByEntityId(entityType, entityID, includeWC = true) {
        let transformers = game.settings.get("swade-toolkit", "transformers");
        let entityTransformers = {};
        for (let triggerName of Object.keys(transformers)) {
            if (includeWC) {
                entityTransformers[triggerName] = transformers[triggerName].filter((el) => ((el.entityID == entityID || el.entityID == "*") && el.entityType == entityType)).sort(Handler.execOrderSort);
            }
            else {
                entityTransformers[triggerName] = transformers[triggerName].filter((el) => (el.entityID == entityID && el.entityType == entityType)).sort(Handler.execOrderSort);
            }
        }
        return entityTransformers;
    }
}
