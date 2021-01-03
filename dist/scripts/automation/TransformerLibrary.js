export class TransformerLibrary {
    constructor() {
        this._templates = [];
        this._templates.push(...TransformerLibrary.defaultTransformers());
        this._templates.push(...this.getCustomTransformers());
    }
    addTransformerTemplate(newTemplate) {
        this._templates.push(newTemplate);
    }
    removeTransformerTemplate(templateName) {
        this._templates = this._templates.filter(el => el.name != templateName);
    }
    getCustomTransformers() {
        let customTransformers = [];
        //read from the globally stored transformers
        //read from this user's stored transformers
        //read from transformers.json
        return customTransformers;
    }
    get templates() { return this._templates; }
    static defaultTransformers() {
        let defaultTransformers = [];
        //should return a list of default transformers
        //Combat
        // Range Penalty
        // Multi Action Penalty
        // Cover Penalty
        // Recoil
        // Unstable Platform
        // Double Tap Edge
        // Target Parry/Toughness
        // Gritty Damage
        // ReRoll w/ Benny
        return defaultTransformers;
    }
}
