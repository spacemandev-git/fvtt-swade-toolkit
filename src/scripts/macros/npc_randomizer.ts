npc_radomizer()

async function npc_radomizer() {
  const l = (key:string) => {return game.i18n.localize("NPC_Randomizer."+key)}
  class NPC_Randomize_Form extends FormApplication{
    constructor(obj={}, options={}){
      super(obj,  options)
    }

    static get defaultOptions(){
      return mergeObject(super.defaultOptions, {
        id: "npc_randomizer_form",
        title: l("NPC_Randomizer"),
        template: "modules/swade-toolkit/templates/npc_randomizer.hbs",
        width: 400,
        closeOnSubmit: false
      })
    }

    getData(){
      return {
        actors: game.actors.entries,
        packs: game.packs.filter(el => el.entity == "Item")
      }
    }

    async _updateObject(evt, data){
      //console.log(evt)
      console.log(data)
      let items = []
      //@ts-ignore
      for(let pack of game.packs.entries.filter(el => el.entity == "Item")){
        if(data[pack.collection] > 0){
          let packContent = await pack.getContent();
          if(data[pack.collection] > packContent.length){
            ui.notifications.error(`${pack.title} only has (${packContent.length}) entries and you're trying to roll on it (${data[pack.collection]}) times`)
            return;
          }

          let packItems = []
          for(let i=0; i<data[pack.collection]; i++){
            let newItem:Item = packContent[Math.floor(Math.random() * packContent.length)]
            while(packItems.find(item => item.name == newItem.name)){
              newItem = packContent[Math.floor(Math.random() * packContent.length)]
            }
            packItems.push(newItem)
          }
          items = items.concat(packItems)
        }
      }
      let newActor = await Actor.create(duplicate(game.actors.find( (actor:Actor) => actor.id == data.actorTemplate)))
      newActor.update({
        "name": data.actorName,
        "items": items
      })
    }
  }
  new NPC_Randomize_Form().render(true)
}