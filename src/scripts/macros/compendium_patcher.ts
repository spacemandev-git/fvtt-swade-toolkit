compendium_patcher()

async function compendium_patcher(){
  const l = (key:string) => {return game.i18n.localize("Compendium_Patcher."+key)}
  class Compendium_Patcher_Form extends FormApplication{
    constructor(){
      super({},{})
    }
    static get defaultOptions(){
      return mergeObject(super.defaultOptions, {
        id:"compendium_patcher_form",
        title:l("Compendium_Patcher"),
        template: "modules/swade-toolkit/templates/macros/compendium_patcher.hbs",
        width: 400,
        closeOnSubmit: false  
      })
    }
    
    getData(){
      return {
        folders: game.folders.filter(folder => folder.type == "Actor"),
        packs: game.packs.filter(pack => pack.entity == "Item")
      }
    }

    async _updateObject(_evt, _data){
      const patchActors = async (data) => {
        console.log("Patching!")
        console.log(data)
        //@ts-ignore
        let actors = game.folders.get(data.actorFolder).content
        let packs = game.packs.map((pack) => {
          if(data[pack.collection] == true){
            return pack
          }
        })
        .filter(el => el != undefined)

        let packContents = []

        for(let pack of packs){
          packContents.push(await pack.getContent());
        }
        
        const findItem = (item) => {
          if(item.type == "hindrance"){
            for(let pack of packContents){
              let foundItem = pack.find(el => (el.name.includes(item.name) && el.type == item.type))
              if(foundItem){return foundItem;}
            }
          } else {
            for(let pack of packContents){
              let foundItem = pack.find(el => (el.name == item.name && el.type == item.type))
              if(foundItem){return foundItem;}
            }
          }
          return undefined;
        }

        for(let actor of actors){
          for(let item of actor.items){
            let patchedItem = findItem(item);
            if(!patchedItem){continue;} //no matching item found in any of the packs
            patchedItem = duplicate(patchedItem); //necessary so we aren't passing in the reference
            if(item.type == "skill" || item.type == "power" || item.type == "hindrance"){
              //powers specify an AB and skills have die types associated with them so don't mess with those
              item.update({
                "data.description": patchedItem.data.description
              })
            } else {
              item.update(patchedItem)
            }
          }
        }
      }

      new Dialog({
        title: l("Confirm"),
        content: `
        <h1>${l("ConfirmHelp")}</h1>
        `,
        buttons: {
          confirm: {
            label: l("Patch"),
            callback: () => {
              new Dialog({
                title: l("Confirm2"),
                content: `
                <h1>${l("Confirm2")}</h1>
                `,
                buttons: {
                  confirm: {
                    label: l("Accept2"),
                    callback: () => {patchActors(_data)}
                  }
                }
              }).render(true)
            }
          }
        }
      }).render(true)
    }
  }
  new Compendium_Patcher_Form().render(true)
}