var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Hooks.on("ready", () => {
    /*
    This menu should show a list of all active transformers for a given Handler
    Transformers can be "disabled" or "deleted"
    "Disabled" is important because of transformers that get loaded on reload, as deleting them would just recreate them on reload
    "Deleting" will work when it's a Transformer that's been added as a user action
    */
    game.settings.registerMenu("swade-toolkit", "handler-menu", {
        name: JSON.stringify(game.i18n.localize("Automation.Automation_Text")).replace("\"", ""),
        label: game.i18n.localize("Automation.Transformers_Button"),
        hint: game.i18n.localize("Automation.Transformers_Hint"),
        type: TransformerSettings,
        restricted: false,
    });
    game.settings.register("swade-toolkit", "templates", {
        name: "DB for Template Objects for the Handler",
        scope: "world",
        config: false,
        type: Object,
        default: {},
        onChange: (value) => {
            console.log("SWADE Toolkit | Transformers Updated", value);
        }
    });
});
class TransformerSettings extends FormApplication {
    constructor(obj, opts = {}) {
        super(obj, opts);
    }
    getData() {
        return {};
    }
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "swade-toolkit-transformer-settings",
            title: JSON.stringify(game.i18n.localize("Automation.Automation_Text")).replace("\"", ""),
            template: 'modules/swade-toolkit/templates/automation/TransformerSettings.hbs',
            width: 400
        });
    }
    activateListeners(html) {
        return __awaiter(this, void 0, void 0, function* () {
            html.find("#importAutomationRuleset").on("click", (evt) => __awaiter(this, void 0, void 0, function* () {
                new FilePicker({
                    callback: (path) => __awaiter(this, void 0, void 0, function* () {
                        let importRuleset = yield (yield fetch(path)).json();
                        console.log(`SWADE Toolkit | Importing Ruleset ${importRuleset}`);
                        for (let transformerList of Object.values(importRuleset)) {
                            game.automation.library.addTransformerTemplates(transformerList);
                        }
                    })
                }).render(true);
            }));
            html.find("#viewRulesets").on("click", (evt) => {
                console.log("Hello World!");
            });
        });
    }
}
export class TransformerLibrary {
    addTransformerTemplates(newTemplates) {
        return __awaiter(this, void 0, void 0, function* () {
            let currentTemplates = game.settings.get("swade-toolkit", "templates");
            for (let newTemplate of newTemplates) {
                currentTemplates[newTemplate.trigger].push(newTemplate);
            }
            yield game.settings.set("swade-toolkit", "templates", currentTemplates);
        });
    }
    removeTransformerTemplate(trigger, templateName) {
        return __awaiter(this, void 0, void 0, function* () {
            let currentTemplates = game.settings.get("swade-toolkit", "templates");
            currentTemplates[trigger] = currentTemplates[trigger].filter(el => el.name != templateName);
            yield game.settings.set("swade-toolkit", "templates", currentTemplates);
        });
    }
    get templates() {
        return game.settings.get("swade-toolkit", "templates");
    }
}
