import { SwadeAction } from "./IAction.js";

export class Handler{
  /**
   * This is a list of triggers that the Action Handler listens for
   * It doesn't correspond 1:1 with the name of the hooks because the Handler repackages hooks to better suit these triggers
   * Sometimes various hooks trigger the same Trigger, or there might not be an exact hook that accomplishes what needs to happen.
   * 
   */
  Triggers = ["ItemAction"]

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
    if(game.settings.get("swade-toolkit", "automation") == false){return;} // don't start listeners if there's automation isn't on.
    Hooks.on("swadeAction", async (actor: Actor, item:Item, actionID: string, roll:Roll | Promise<Roll>, userId:string) => {
      console.log("Called swadeAction:", actor, item, actionID, await roll, userId);
      if(!actor.owner || !roll){
        //Only process the hook on the machine that the owns the Actor
        //don't process if roll is null (user canceled action)
        return;
      }

      //suppress the Chat Message that was just created by the user that did the action
      Hooks.once("createChatMessage", (chatMessage:ChatMessage, opts:any, userId:string) => {
        if(userId == game.userId){
          chatMessage.delete();
        }         
      })

      //We're going to abuse the roll object here a little bit by stuffing a "modifiers" list in there
      //Ideally every transformer will append this list to include the modifiers they added and the description of them
      roll['modifiers'] = [];
     
      roll['chatMessage'] = undefined;
      
      let transformers = this.getTransformersByEntityId("Actor", actor.id)['ItemAction']
      await this.processTransformers(transformers, {actor: actor, item: item, actionID: actionID, roll:await roll, userId: userId, token:undefined, haltExecution:false})

      let actorTokens:Token[] = canvas.tokens.placeables.filter((token:Token) => token.actor.id == actor.id)
      if(actorTokens.length == 0){
        //There are no tokens
        return;
      } 
      // After Actor Transformers are done pass to Token Transformers
      for(let token of actorTokens){
        // If the same transformer (like Ammo Counter) is registered for two tokens of the same actor, there's no way to differentiate when they should fire
        // As such, the transformer should only fire for the _currently selected token_ which can be fetched in the transformer by canavs.tokens.controlled[0]
        console.log(`SWADE Toolkit | Processing Token: ${token.name}`)
        let transformers = this.getTransformersByEntityId("Token", token.id)['ItemAction']
        await this.processTransformers(transformers, {actor: actor, item: item, actionID: actionID, roll:roll, userId: userId, token:token, haltExecution:false})
      }
    })
  }

  private async processTransformers(transformers: ITransformer[], args: any){
    let haltExecution = false;
    for(let transformer of transformers){
      args.transformer = transformer; 
      if(haltExecution){return;}
      let transformFunction = eval(transformer.transformer);
      let mutation = await transformFunction(args);
      for(let key of Object.keys(mutation)){
        args[key] = mutation[key];
        haltExecution = mutation['haltExecution']
      }
    }
  }

  private getDefaultObject = () => {
    let obj = {}
    this.Triggers.forEach(t => {
      obj[t] = []
    })
    return obj;
  }

  private registerSettings(){

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
      onChange: (value: any) => {
        console.log("SWADE Toolkit | Transformers Updated", value)
      }
    })

    game.settings.register('swade-toolkit', 'automation', {
      name: game.i18n.localize("Automation.Toggle_Automation"),
      hint: game.i18n.localize("Automation.Automation_Setting_Hint"),
      scope: "world",
      config: true,
      type: Boolean,
      default: false,
      onChange: (value: boolean) => {
        console.log("SWADE Toolkit | Automation:", value);
        if(value){
          this.startListeners();
        }
      }
    })
  }

  public get transformers(){
    return game.settings.get("swade-toolkit", "transformers")
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

  public async resetTransformers(){
    await game.settings.set("swade-toolkit", "transformers", this.getDefaultObject())
  }

  /**
   * Returns a version of the transformers object, with only the transformers that are apply to the passed entity ID
   * Returns not just the transformers for that entity but also any wild card transformers.
   * @param entityType The type of the entity to filter for
   * @param entityID The ID of the entity you want to fetch the transformers for
   */
  public getTransformersByEntityId(entityType:ITransformer['entityType'], entityID: string, includeWC=true){
    let transformers = game.settings.get("swade-toolkit", "transformers")
    let entityTransformers = {}
    for(let triggerName of Object.keys(transformers)){
      if(includeWC){
        entityTransformers[triggerName] = transformers[triggerName].filter((el:ITransformer) => ((el.entityID == entityID || el.entityID == "*") && el.entityType == entityType)).sort(Handler.execOrderSort)
      } else {
        entityTransformers[triggerName] = transformers[triggerName].filter((el:ITransformer) => (el.entityID == entityID && el.entityType == entityType)).sort(Handler.execOrderSort)        
      }
    }
    return entityTransformers;
  }
}

export interface ITransformer {
  name: string,
  isActive: boolean,
  entityID: string | "*",
  version: string,
  entityType: "Token" | "Actor" | "Scene" | "JournalEntry" | "RollTable",
  duration: number, //in seconds
  trigger: string,
  execOrderNum: number,
  description: string,
  transformer: string //eval this to get the transformer function
}