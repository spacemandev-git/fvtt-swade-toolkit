export * from "./ActionHandler.js";

export class TransformerSettings extends FormApplication{
  constructor(obj, opts={}){
    super(obj, opts)
  }

  getData(){
    return {}
  }

  static get defaultOptions(){
    return mergeObject(super.defaultOptions, {
      id: "swade-toolkit-transformer-settings",
      title: game.i18n.localize("SWADE_Handlers.Automation"),
      template: 'modules/swade-toolkit/templates/TransformerSettings.hbs'
    })
  }

  async activateListeners(html){}
}

export interface ITransformer {
  name: string,
  isActive: boolean,
  entityID: string,
  entityType: "Token" | "Actor" | "Scene" | "JournalEntry" | "RollTable",
  execOrderNum: number,
  transformer: string //eval this to get the transformer function
}