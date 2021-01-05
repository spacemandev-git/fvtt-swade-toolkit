import {ITransformer} from './Handler.js'

Hooks.on("ready", ()=>{
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
    onChange: (value: any) => {
      console.log("SWADE Toolkit | Transformers Updated", value)
    }
  })
})

class TransformerSettings extends FormApplication{
  constructor(obj, opts={}){
    super(obj, opts)
  }

  getData(){
    return {}
  }

  static get defaultOptions(){
    return mergeObject(super.defaultOptions, {
      id: "swade-toolkit-transformer-settings",
      title: JSON.stringify(game.i18n.localize("Automation.Automation_Text")).replace("\"", ""),
      template: 'modules/swade-toolkit/templates/TransformerSettings.hbs',
      width: 400
    })
  }

  async activateListeners(html:JQuery<HTMLElement>){
    html.find("#importAutomationRuleset").on("click", async (evt) => {
      new FilePicker({
        callback : async (path:string) => {
          let importRuleset = await (await fetch(path)).json();
          console.log(`SWADE Toolkit | Importing Ruleset ${importRuleset}`);
          for(let transformerList of Object.values(importRuleset)){
            game.automation.library.addTransformerTemplates(transformerList);
          }
        }
      }).render(true);
    })

    html.find("#viewRulesets").on("click", (evt) => {
      console.log("Hello World!")
    })
  }
}

export class TransformerLibrary{
  public async addTransformerTemplates(newTemplates:ITransformer[]){
    let currentTemplates = game.settings.get("swade-toolkit", "templates")
    for(let newTemplate of newTemplates){
      currentTemplates[newTemplate.trigger].push(newTemplate);
    }
    await game.settings.set("swade-toolkit", "templates", currentTemplates)
  }

  public async removeTransformerTemplate(trigger, templateName: string){
    let currentTemplates = game.settings.get("swade-toolkit", "templates")
    currentTemplates[trigger] = currentTemplates[trigger].filter(el => el.name != templateName);
    await game.settings.set("swade-toolkit", "templates", currentTemplates)
  }

  public get templates(){
    return game.settings.get("swade-toolkit", "templates");
  }
}