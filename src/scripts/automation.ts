import {Handler} from './automation/Handler.js'
import {TransformerLibrary} from './automation/TransformerLibrary.js'
Hooks.on("ready", () => {
  //Register Automation Handler
  game.automation = new Handler();
  game.automation.library = new TransformerLibrary(); 

  Hooks.call("swade-toolkit-handler-ready")
  //Load DefaultTransformers for every Actor
})

/* Test Script Area */
import {ITransformer} from './automation/Handler.js'
Hooks.on("swade-toolkit-handlers-ready", ()=>{
  //return; //Uncomment for packaging for production

  //remove the existing one so you can always have fresh code during testing
  game.automation.removeTransformer("ShowChatCard", `reload-transformer-${game.actors.entities[0].id}`)
  let reloadTransformer: ITransformer = {
    name: `reload-transformer-${game.actors.entities[0].id}`,
    isActive: true,
    description: "Test transformer",
    entityID: game.actors.entities[0].id,
    entityType: "Actor",
    execOrderNum: 1,
    transformer: ((actor, item, actionID, roll) => {
      console.log("Hello");
      return {actor, item, actionID, roll}
    }).toString()
  }
  game.automation.registerTransformer("ShowChatCard", reloadTransformer)

  //Simple handler that removes the # of bullets used by an action as stipulated in the shots
  
})