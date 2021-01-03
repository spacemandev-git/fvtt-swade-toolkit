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
  //Simple handler that removes the # of bullets used by an action as stipulated in the shots
  
})