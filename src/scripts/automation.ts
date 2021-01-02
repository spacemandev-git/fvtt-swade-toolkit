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
  let reloadTransformer: Handlers.ITransformer = {
    name: `reload-transformer-${game.actors.entities[0].id}`,
    isActive: true,
    entityID: game.actors.entities[0].id,
    entityType: "Actor",
    transformer: `(actor, item, actionID, roll) => {
      console.log("Hello");
      return {actor, item, actionID, roll}
    }`
  }
  console.log(reloadTransformer)
  game.handlers.action.registerTransformer("ShowChatCard", reloadTransformer)

})