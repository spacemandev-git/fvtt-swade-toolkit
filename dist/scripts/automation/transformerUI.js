// Add/remove transformers from token/scene
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Add/remove keywords from scene
Hooks.on("controlToken", (token, controlled) => {
    if (!controlled) {
        // Token is being deselected
        document.getElementById("tokenTransformersButton").remove();
    }
    else {
        let transformersButton = $(`<i id='tokenTransformersButton' class="control-icon fas fa-robot fa-3x" title=${game.i18n.localize("Automation.Transformers_Button")}></i>`);
        transformersButton.appendTo(document.body);
        transformersButton.on('click', (evt) => __awaiter(void 0, void 0, void 0, function* () {
            if (document.getElementById('tokenTransformerMenu') && evt.target.id == "tokenTransformersButton") {
                document.getElementById('tokenTransformerMenu').remove();
            }
            else if (!document.getElementById("tokenTransformerMenu")) {
                let tokenTransformers = game.automation.getTransformersByEntityId("Token", token.id);
                let actorTransformers = game.automation.getTransformersByEntityId("Actor", token.actor.id);
                let tMenu = $(yield renderTemplate('modules/swade-toolkit/templates/TokenTransformers.hbs', { token: tokenTransformers, actor: actorTransformers }));
                transformersButton.append(tMenu);
                //Listeners for each of the buttons
                tMenu.find("#addTransformerButton").on("click", (evt) => {
                    new AddTransformerUI({
                        entityID: token.id,
                        entityType: "Token"
                    }).render(true);
                });
                //HTML Triggers for the Buttons on the Actor Transformers
                for (let trigger of Object.keys(actorTransformers)) {
                    for (let transformer of actorTransformers[trigger]) {
                        //Info Button
                        $(document.getElementById(`actor-info-${trigger}-${transformer.name}`)).on("click", (evt) => __awaiter(void 0, void 0, void 0, function* () {
                            new Dialog({
                                title: transformer.name,
                                content: yield renderTemplate('modules/swade-toolkit/templates/TransformerInfo.hbs', transformer),
                                buttons: {
                                    ok: {
                                        label: game.i18n.localize("Automation.Close")
                                    }
                                }
                            }, { width: 600 }).render(true);
                        }));
                        //Enable/Disable Button
                        $(document.getElementById(`actor-active-${trigger}-${transformer.name}`)).on("click", (evt) => {
                            if (transformer.isActive) {
                                transformer.isActive = false;
                                game.automation.updateTransformer(trigger, transformer);
                                document.getElementById(`actor-active-${trigger}-${transformer.name}`).style.color = "#CCC";
                            }
                            else {
                                transformer.isActive = true;
                                game.automation.updateTransformer(trigger, transformer);
                                document.getElementById(`actor-active-${trigger}-${transformer.name}`).style.color = "lime";
                            }
                        });
                        //Delete Button
                        $(document.getElementById(`actor-delete-${trigger}-${transformer.name}`)).on("click", (evt) => {
                            game.automation.removeTransformer(trigger, transformer.name);
                            document.getElementById(`${trigger}-${transformer.name}-row`).remove();
                        });
                    }
                }
                //HTML Triggers for the Buttons on the Token Transformers
                for (let trigger of Object.keys(tokenTransformers)) {
                    for (let transformer of tokenTransformers[trigger]) {
                        //Info Button
                        $(document.getElementById(`token-info-${trigger}-${transformer.name}`)).on("click", (evt) => __awaiter(void 0, void 0, void 0, function* () {
                            new Dialog({
                                title: transformer.name,
                                content: yield renderTemplate('modules/swade-toolkit/templates/TransformerInfo.hbs', transformer),
                                buttons: {
                                    ok: {
                                        label: game.i18n.localize("Automation.Close")
                                    }
                                }
                            }, { width: 600 }).render(true);
                        }));
                        //Enable/Disable Button
                        $(document.getElementById(`token-active-${trigger}-${transformer.name}`)).on("click", (evt) => {
                            if (transformer.isActive) {
                                transformer.isActive = false;
                                game.automation.updateTransformer(trigger, transformer);
                                document.getElementById(`token-active-${trigger}-${transformer.name}`).style.color = "#CCC";
                            }
                            else {
                                transformer.isActive = true;
                                game.automation.updateTransformer(trigger, transformer);
                                document.getElementById(`token-active-${trigger}-${transformer.name}`).style.color = "lime";
                            }
                        });
                        //Delete Button
                        $(document.getElementById(`token-delete-${trigger}-${transformer.name}`)).on("click", (evt) => {
                            game.automation.removeTransformer(trigger, transformer.name);
                            document.getElementById(`${trigger}-${transformer.name}-row`).remove();
                        });
                    }
                }
            }
        }));
    }
});
export class AddTransformerUI extends FormApplication {
    constructor(obj, opts = {}) {
        super(obj, opts);
        this._selection = {
            name: "",
            isActive: false,
            entityID: "",
            entityType: "Token",
            duration: -1,
            trigger: "ItemAction",
            execOrderNum: 1,
            description: "",
            transformer: ""
        };
        this._selection.entityID = obj.entityID;
        this._selection.entityType = obj.entityType;
    }
    getData() {
        return {
            templates: game.automation.library.templates,
            triggers: game.automation.Triggers,
            currentSelection: this._selection,
        };
    }
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "addTransformerToTokenDialog",
            name: game.i18n.localize("Automation.Transformers"),
            template: "modules/swade-toolkit/templates/AddTokenTransformer.hbs",
            height: 400,
            width: 700
        });
    }
    activateListeners(html) {
        html.find("#loadTemplate").on("click", (evt) => {
            //Load Template from Library
            let templateName = html.find("#templateName").val();
            let transformer = game.automation.library.templates.find(el => el.name == templateName);
            transformer.entityID = html.find("#entityID").val().toString();
            transformer.entityType = html.find("#entityType").val.toString();
            this._selection = transformer;
            //Render True
            this.render(true);
        });
        html.find("#registerTokenTransformerButton").on("click", (evt) => __awaiter(this, void 0, void 0, function* () {
            //take ID fields and build a transformer
            //change name to name-entityID when creating the transformer
            let transformer = {
                name: html.find("#transformer-name").val().toString() + "-" + html.find("#entityID").val().toString(),
                isActive: html.find("#isActive").is(":checked"),
                entityID: html.find("#entityID").val().toString(),
                entityType: "Token",
                duration: parseInt(html.find("#duration").val().toString()),
                trigger: html.find("#trigger").val().toString(),
                execOrderNum: parseInt(html.find("#execOrderNum").val().toString()),
                description: html.find("#description").val().toString(),
                transformer: html.find("#transformer-function").val().toString()
            };
            game.automation.registerTransformer(transformer.trigger, transformer);
            //UI Notifications that it was added
            let actorName = canvas.tokens.placeables.find(el => { var _a; return el.id == ((_a = html.find("#entityID")) === null || _a === void 0 ? void 0 : _a.val().toString()); }).actor.name;
            ui.notifications.info(`Transformer (${transformer.name}) added to Token (${actorName ? actorName : "*"})`);
            //Refresh Transformer Menu
            document.getElementById('tokenTransformerMenu').remove();
        }));
        html.find("#registerActorTransformerButton").on("click", (evt) => __awaiter(this, void 0, void 0, function* () {
            //take ID fields and build a transformer
            //change name to name-entityID when creating the transformer
            let entityID = html.find("#entityID").val().toString() == "*" ? "*" : canvas.tokens.placeables.find(el => el.id == html.find("#entityID").val().toString()).actor.id;
            let transformer = {
                name: html.find("#transformer-name").val().toString() + "-" + html.find("#entityID").val().toString(),
                isActive: html.find("#isActive").is(":checked"),
                entityID: entityID,
                entityType: "Actor",
                duration: parseInt(html.find("#duration").val().toString()),
                trigger: html.find("#trigger").val().toString(),
                execOrderNum: parseInt(html.find("#execOrderNum").val().toString()),
                description: html.find("#description").val().toString(),
                transformer: html.find("#transformer-function").val().toString()
            };
            game.automation.registerTransformer(transformer.trigger, transformer);
            //UI Notifications that it was added
            ui.notifications.info(`Transformer (${transformer.name}) added to Actor (${canvas.tokens.placeables.find(el => el.id == html.find("#entityID").val().toString()).actor.name})`);
            //Refresh Transformer Menu
            document.getElementById('tokenTransformerMenu').remove();
        }));
    }
}
