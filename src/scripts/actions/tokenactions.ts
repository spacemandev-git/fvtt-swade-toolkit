Hooks.on("renderTokenHUD", async (tokenHUD:TokenHUD, html:any, opts:any) => {
  console.log(tokenHUD, html, opts)

  //@ts-ignore
  let currentActor = game.actors.get(opts.actorId);
  const actionsButton = $(`<i class="control-icon fas fa-gavel swade-hud-actions" title=${game.i18n.localize("SWADE_Actions.Actions")}></i>`)
  //@ts-ignore
  let actionsList = await renderTemplate('modules/swade-toolkit/templates/ActionsList.hbs', getActionsList(Array.from(currentActor.items)))
  actionsButton.append(actionsList)
  html.find(".right").append(actionsButton);

  //make the thingies drag droppable
  //@ts-ignore
  const dragDrop = new DragDrop({
    dragSelector: ".swade-action",
    dropSelector: "#board",
    permissions: { dragstart: this._canDragStart.bind(this), drop: this._canDragDrop.bind(this) },
    callbacks: { dragstart: this._onDragStart.bind(this), drop: this._onDragDrop.bind(this) }
  });
  //@ts-ignore
  dragDrop.bind(html);
})  

function getActionsList(actorItems:Item[]){
  let actionsList = []
  for(let item of actorItems){
    if(item.data.data.actions && item.data.data.equipped){
      let itemActions = item.data.data.actions.additional
      for(let key of Object.keys(itemActions)){
        let action = itemActions[key];
        actionsList.push({
          name: item.name+":"+action.name,
          img: item.img,
          itemID: item.id,
          actionID: key
        }) // don't need anything else as I can look it up with Item+ActionID (already know Actor for selected Token)
      }
    }
  }
  return actionsList;
}