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
        let transformersButton = $(`<i id='tokenTransformersButton' class="control-icon fab fa-buffer fa-3x" title=${game.i18n.localize("Automation.Transformers_Button")}></i>`);
        transformersButton.appendTo(document.body);
        transformersButton.on('click', (evt) => __awaiter(void 0, void 0, void 0, function* () {
            if (document.getElementById('tokenTransformerMenu') && evt.target.id == "tokenTransformersButton") {
                document.getElementById('tokenTransformerMenu').remove();
            }
            else if (!document.getElementById("tokenTransformerMenu")) {
                let entityTransformers = game.automation.getTransformerByEntityId(token.id);
                let tMenu = $(yield renderTemplate('modules/swade-toolkit/templates/TokenTransformers.hbs', { triggers: entityTransformers }));
                transformersButton.append(tMenu);
                //Listeners for each of the buttons
                tMenu.find("#addTransformerButton").on("click", (evt) => {
                    console.log("Add Transformer Button Clicked");
                    new AddTransformerUI({
                        entityID: token.id,
                        entityType: "Token"
                    }).render(true);
                });
                for (let trigger of Object.keys(entityTransformers)) {
                    for (let transformer of entityTransformers[trigger]) {
                        //Info Button
                        $(document.getElementById(`info-${trigger}-${transformer.name}`)).on("click", (evt) => __awaiter(void 0, void 0, void 0, function* () {
                            new Dialog({
                                title: transformer.name,
                                content: yield renderTemplate('modules/swade-toolkit/templates/TransformerInfo.hbs', { trigger: trigger, transformer: transformer }),
                                buttons: {
                                    ok: {
                                        label: game.i18n.localize("Automation.Close")
                                    }
                                }
                            }).render(true);
                        }));
                        //Enable/Disable Button
                        $(document.getElementById(`active-${trigger}-${transformer.name}`)).on("click", (evt) => {
                            if (transformer.isActive) {
                                transformer.isActive = false;
                                game.automation.updateTransformer(trigger, transformer);
                                document.getElementById(`active-${trigger}-${transformer.name}`).style.color = "#CCC";
                            }
                            else {
                                transformer.isActive = true;
                                game.automation.updateTransformer(trigger, transformer);
                                document.getElementById(`active-${trigger}-${transformer.name}`).style.color = "lime";
                            }
                        });
                        //Delete Button
                        $(document.getElementById(`delete-${trigger}-${transformer.name}`)).on("click", (evt) => {
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
            duration: 0,
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
            //templates: game.automation.library.templates,
            templates: [{ name: "Test Template 1" }, { name: "Test Template 2" }, { name: "blah useasdfasdf asdfasdfl eon" }],
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
    activateListeners(html) { }
}
