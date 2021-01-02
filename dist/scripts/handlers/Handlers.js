var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export * from "./ActionHandler.js";
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
