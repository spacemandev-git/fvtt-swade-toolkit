export class Handler{
  /**
   * This is a list of triggers that the Action Handler listens for
   * It doesn't correspond 1:1 with the name of the hooks because the Handler repackages hooks to better suit these triggers
   * Sometimes various hooks trigger the same Trigger, or there might not be an exact hook that accomplishes what needs to happen.
   * 
   * When updating this list, ALSO update the DEFAULTS for the Transformers DB
   */
  Triggers = ["TraitRoll", "ShowChatCard", "ItemAction"]

  constructor(){
   this.registerSettings();
   this.startListeners();
  }

  static execOrderSort(a:ITransformer,b:ITransformer){
    if(a.execOrderNum>b.execOrderNum){return 1;}
    else if(a.execOrderNum<b.execOrderNum){return -1;}
    return 0;
  }

  private startListeners(){
    //SwadeActor, SwadeItem, ChatMessage objects
    Hooks.on("swadeChatCard", async (actor:any, item:any, chatCard:any) => {
      let transformers:ITransformer[] = game.settings.get("swade-toolkit", "transformers").ShowChatCard
      
      // Transformers will be executed from lowest to highest order
      transformers = transformers.sort(Handler.execOrderSort)

      for(let transformer of transformers){
        if(!transformer.isActive){continue;} //ignore disabled transformers
        let transformFunction = eval(transformer.transformer);
        let transformedResult = await transformFunction(actor, item, chatCard)
        actor = transformedResult.actor
        item = transformedResult.item,
        chatCard = transformedResult.chatCard
      }
    })

    //SwadeActor, SwadeItem, ActionID, Roll Object
    Hooks.on("swadeChatCardAction", async (actor: any, item:any, actionID: string, roll:Roll) => {
      let transformers = game.settings.get("swade-toolkit", "transformers").ItemAction
      for(let transformer of transformers){
        let transformFunction = eval(transformer.transformer);
        let transformedResult = await transformFunction(actor, item, actionID, roll)
        actor = transformedResult.actor
        item = transformedResult.item,
        actionID = transformedResult.chatCard,
        roll = transformedResult.roll
      }
    })

    //TODO: TraitRoll
  }

  private registerSettings(){
    /*
      This menu should show a list of all active transformers for a given Handler
      Transformers can be "disabled" or "deleted"
      "Disabled" is important because of transformers that get loaded on reload, as deleting them would just recreate them on reload
      "Deleting" will work when it's a Transformer that's been added as a user action

    */
    game.settings.registerMenu("swade-toolkit", "handler-menu", {
      name: game.i18n.localize("Automation.Automation"),
      label: game.i18n.localize("Automation.Transformers_Button"),
      hint: game.i18n.localize("Automation.Transformers_Hint"),
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
      onChange: (value: any) => {
        console.log("SWADE Toolkit | Transformers Updated", value)
      }
    })
  }

  /**
   * 
   * Registers a new transformer object on a given trigger for the handler
   * Transformers must have a unique name else will be rejected
   * @param triggerName String, must be in the list of approved triggers for this handler
   * @param transformerObj Handler Object, see Handler Interface for more details
   */
  public async registerTransformer(triggerName: string, transformerObj:ITransformer){
    try{
      if(!this.Triggers.includes(triggerName)){
        throw new Error(`Trigger ${triggerName} not found in list of triggers.`)
      }
      let transformers = game.settings.get("swade-toolkit", "transformers")
      if(transformers[triggerName].find(el => el.name == transformerObj.name) != undefined){
        //throw new Error(`Trigger ${transformerObj.name} already exists`)
        return false;
      }
      transformers[triggerName].push(transformerObj)
      await game.settings.set("swade-toolkit","transformers", transformers)
      return true;
    } catch (e) {
      throw e;
    }
  }

  /**
   * Just a wrapper that deals with register/remove in a combined call
   * @param triggerName 
   * @param transformerObj 
   */
  public async updateTransformer(triggerName:string, transformerObj:ITransformer){
    this.removeTransformer(triggerName, transformerObj.name);
    this.registerTransformer(triggerName, transformerObj);
  }
  /**
   * Removes a registered transformer from the trigger list
   * @param triggerName 
   * @param transformerName 
   */
  public async removeTransformer(triggerName:string, transformerName:string){
    try{
      if(!this.Triggers.includes(triggerName)){
        throw new Error(`Trigger ${triggerName} not found in list of triggers.`)
      }
      let transformers = game.settings.get("swade-toolkit", "transformers")
      if(transformers[triggerName].find(el => el.name == transformerName) == undefined){
        return true;
      } else {
        transformers[triggerName] = transformers[triggerName].filter(el => el.name != transformerName)
      }
      await game.settings.set("swade-toolkit","transformers", transformers)
      return true;
    } catch (e) {
      throw e;
    }
  }

  /**
   * Returns a version of the transformers object, with only the transformers that are apply to the passed entity ID
   * @param entityID The ID of the entity you want to fetch the transformers for
   */
  public getTransformerByEntityId(entityID: string){
    let transformers = game.settings.get("swade-toolkit", "transformers")
    let entityTransformers = {}
    for(let triggerName of Object.keys(transformers)){
      entityTransformers[triggerName] = transformers[triggerName].filter((el:ITransformer) => el.entityID == entityID).sort(Handler.execOrderSort)
    }
    return entityTransformers;
  }
}

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
      title: game.i18n.localize("Automation.Automation"),
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
  duration: number, //in seconds
  trigger: string,
  execOrderNum: number,
  description: string,
  transformer: string //eval this to get the transformer function
}