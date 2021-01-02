import * as Handlers from './handlers/Handlers.js'
Hooks.on("ready", () => {
  game.handlers = {
    action: new Handlers.ActionHandler(),
  }

  Hooks.call("swade-toolkit-handlers-ready")
})

/* Test Script Area */

Hooks.on("swade-toolkit-handlers-ready", ()=>{
  //return; //Uncomment for packaging for production

  //remove the existing one so you can always have fresh code during testing
  game.handlers.action.removeTransformer("ShowChatCard", `reload-transformer-${game.actors.entities[0].id}`)
  let reloadTransformer: Handlers.ITransformer = {
    name: `reload-transformer-${game.actors.entities[0].id}`,
    isActive: true,
    entityID: game.actors.entities[0].id,
    entityType: "Actor",
    execOrderNum: 1,
    transformer: ((actor, item, actionID, roll) => {
      console.log("Hello");
      return {actor, item, actionID, roll}
    }).toString()
  }
  game.handlers.action.registerTransformer("ShowChatCard", reloadTransformer)


  //Simple handler that removes the # of bullets used by an action as stipulated in the shots
  
})