var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Hooks.on("renderTokenHUD", (tokenHUD, html, opts) => __awaiter(this, void 0, void 0, function* () {
    console.log(tokenHUD, html, opts);
    //@ts-ignore
    let currentActor = game.actors.get(opts.actorId);
    const actionsButton = $(`<i class="control-icon fa fas-gavel swade-hud-actions" title=${game.i18n.localize("SWADE_Actions.Actions")}></i>`);
    //@ts-ignore
    let actionsList = yield renderTemplate('modules/swade-toolkit/templates/ActionsList.hbs', getActionsList(Array.from(currentActor.items)));
    actionsButton.append(actionsList);
    html.find(".right").append(actionsButton);
}));
function getActionsList(actorItems) {
    let actionsList = [];
    for (let item of actorItems) {
        if (item.data.data.actions && item.data.data.equipped) {
            let itemActions = item.data.data.actions.additional;
            for (let key of Object.keys(itemActions)) {
                let action = itemActions[key];
                actionsList.push({
                    name: item.name + ":" + action.name,
                    img: item.img,
                    itemID: item.id,
                    actionID: key
                }); // don't need anything else as I can look it up with Item+ActionID (already know Actor for selected Token)
            }
        }
    }
    return actionsList;
}
