import { Handler } from './automation/Handler.js';
import { TransformerLibrary } from './automation/TransformerLibrary.js';
Hooks.on("ready", () => {
    //Register Automation Handler
    game.automation = new Handler();
    game.automation.library = new TransformerLibrary();
    Hooks.call("swade-toolkit-handler-ready");
    //Load DefaultTransformers for every Actor
});
/**
 * @param token is of type *any* because it's the token data, not the token itself
 */
Hooks.on("deleteToken", (scene, token, obj, userId) => {
    if (game.userId != userId) {
        return;
    } //only process this on the machine that made the token
    //Delete all the transformers related to this token
    for (let transformer of game.automation.getTransformersByEntityId('Token', token.id, false)) {
        game.automation.removeTransformer(transformer.trigger, transformer.name);
    }
});
Hooks.on("deleteToken", (actor, obj, userId) => {
    if (game.userId != userId) {
        return;
    } //only process this on the machine that made the token
    //Delete all the transformers related to this token
    for (let transformer of game.automation.getTransformersByEntityId('Actor', actor.id, false)) {
        game.automation.removeTransformer(transformer.trigger, transformer.name);
    }
});
