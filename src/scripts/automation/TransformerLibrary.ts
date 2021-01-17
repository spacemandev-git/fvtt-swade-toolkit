import {ITransformer} from './Handler.js'

Hooks.on("ready", ()=>{
  /*
  Transformers can be "disabled" or "deleted"
  "Disabled" is important because of transformers that get loaded on reload, as deleting them would just recreate them on reload
  "Deleting" will work when it's a Transformer that's been added as a user action
  */
  game.settings.registerMenu("swade-toolkit", "handler-menu", {
    name: game.i18n.localize("Automation.Automation_Rulesets"),
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
      console.debug("SWADE Toolkit | Transformer Templates Updated", value)
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
      title: JSON.stringify(game.i18n.localize("Automation.Automation_Text")).replace(/\"/g, ""),
      template: 'modules/swade-toolkit/templates/automation/TransformerSettings.hbs',
      width: 400
    })
  }

  async activateListeners(html:JQuery<HTMLElement>){
    html.find("#importAutomationRuleset").on("click", async (evt) => {
      new FilePicker({
        callback : async (path:string) => {
          let importRuleset = await (await fetch(path)).json();
          console.log(`SWADE Toolkit | Ruleset ${importRuleset}`);
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
      if(!currentTemplates[newTemplate.trigger]){
        currentTemplates[newTemplate.trigger] = [];
      }
      currentTemplates[newTemplate.trigger].push(newTemplate);
    }
    await game.settings.set("swade-toolkit", "templates", currentTemplates)
  }

  public async removeTransformerTemplate(trigger, templateName: string){
    let currentTemplates = game.settings.get("swade-toolkit", "templates")
    currentTemplates[trigger] = currentTemplates[trigger].filter(el => el.name != templateName);
    await game.settings.set("swade-toolkit", "templates", currentTemplates)
  }

  public async resetTemplates(){
    await game.settings.set("swade-toolkit", "templates", {})
    await this.addTransformerTemplates(this.defaultTransformers)
  }

  public get templates(){
    return game.settings.get("swade-toolkit", "templates");
  }

  defaultTransformers = [
    {
      name: "Default Roll Message",
      description: "Prints the default roll message based on given rolls.",
      isActive: true,
      entityID: "*",
      entityType: <ITransformer["entityType"]>"Actor",
      duration: -1,
      trigger: "ItemAction",
      execOrderNum: 199, //last thing to be executed
      version: "0.0.1",
      transformer: (async args => {
        if(args.token && canvas.tokens.controlled[0].id != args.token.id){return args;} //only process for selected token
        let speaker = ChatMessage.getSpeaker({actor:args.actor});
        if(args.token){
          speaker = {
            alias: args.token.name
          }
        }
        args.roll['chatMessage'] = await args.roll.toMessage({
          speaker: speaker,
          flavor: game.automation.util.getFlavor(args.actor,args.item,args.actionID,args.roll),
          roll: args.roll.reroll()
        });
  
        return args;
      }).toString()
    },
    {
      name: "Advanced Roll Message",
      description: "Prints the advanced roll message",
      isActive: true,
      entityID: "*",
      entityType: <ITransformer["entityType"]>"Actor",
      duration: -1,
      trigger: "ItemAction",
      execOrderNum: 199, //last thing to be executed
      version: "0.0.1",
      transformer: (async args => {
        if(args.token && canvas.tokens.controlled[0].id != args.token.id){return args;} //only process for selected token
        let speaker = ChatMessage.getSpeaker({actor:args.actor});
        if(args.token){
          speaker = {
            alias: args.token.name
          }
        }

        args.roll['chatMessage'] = await ChatMessage.create({
          speaker: speaker,
          content: await renderTemplate('modules/swade-toolkit/templates/chat/SkillRoll.hbs', {})
        })

        return args;
      }).toString()
    },
    {
      name: "Range Penalty",
      description: "Requires Item Range to be in format (12/24/48) and written in inches. Should only be applied to tokens. Grid Units must be in Inches",
      isActive: true,
      entityID: "*",
      entityType: <ITransformer["entityType"]>"Token",
      duration: -1,
      trigger: "ItemAction",
      execOrderNum: 102,
      version: "0.0.1",
      transformer: (async (args) => {
        return new Promise((resolve, reject) => {
          console.debug("Range Penalty Transformer| Calculating Range Penalty: ", args)
          //find distance between target(x,y) and selected token(X,Y). divide by grid size to get # of units
          //check if aiming status or keyword "#RangePenalty:"
  
          let target = Array.from(game.user.targets)[0]
          let freshItem = canvas.tokens.controlled[0].actor.items.find(el=>el.id == args.item.id)
          let ranges = freshItem.data.data.range.split("/")
          if(ranges.length < 3){console.error("Range not in proper format #/#/#"); resolve(args);}
          if(!args.token || !target){
            // no token means can't measure range
            // no target means you can't process the range
            // no range defined for weapon means no penalty
            resolve(args);
          }
          let distance = Math.floor(Math.sqrt(Math.pow((target.position.x - args.token.position._x),2) + Math.pow((target.position.y - args.token.position._y),2)) / (game.scenes.active.data['grid'] * game.scenes.active.data['gridDistance']))
          console.debug("Range Penalty | Distance: ", distance);
  
          let penalty = 0;
          if(distance <= ranges[0]){
            penalty = 0; //short range
          } else if (distance <= ranges[1]){
            penalty = -2; //medium range
          } else if (distance <= ranges[2]){
            penalty = -4; //long range
          } else {
            penalty = -8; //extreme range
          }
  
          let token = canvas.tokens.controlled[0]
          if(token.data.actorData.effects.find(el => el.label == "Aiming")){
            /*
            if(game.automation.util.findKeywordsOnActor("range", item)){
  
            }
            */
  
            new Dialog({
              title: "Aiming",
              content: "",
              buttons: {
                penalty: {
                  label: "+4 Against Range Penalty",
                  callback: () => {
                    args.roll.modifiers.push({"description": "Range Penalty", "value": penalty})
  
                    penalty = (penalty + 4) >= 0 ? 0 : (penalty + 4)
                    console.debug("Penalty: ", penalty)
                    args.roll.terms.push("+", penalty)
  
                    args.roll.modifiers.push({"description": "Aim Bonus", "value": 4})
                    resolve(args);
                  }
                },
                bonus: {
                  label: "+2 to Skill Roll",
                  callback: () => {
                    console.debug("Penalty: ", penalty)
                    console.debug("Bonus: ", 2)
                    args.roll.modifiers.push({"description": "Range Penalty", "value": penalty});
                    args.roll.modifiers.push({"description": "Aim Bonus", "value": 2});
                    args.roll.terms.push("+", penalty, "+", 2)
                    resolve(args);
                  }
                }
              }
            }).render(true)  
          }
        })
      }).toString()
    }
  ]
}