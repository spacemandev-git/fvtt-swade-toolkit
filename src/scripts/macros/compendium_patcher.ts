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
        template: "modules/swade-toolkit/templates/compendium_patcher.hbs",
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
        let allItems = [];
        let packs = game.packs.map((pack) => {
          if(data[pack.collection] == true){
            return pack
          }
        })
        .filter(el => el != undefined)


        for(let pack of packs){
          allItems = allItems.concat(await pack.getContent());
        }

        for(let actor of actors){
          for(let item of actor.items){
            let patchedItem = allItems.find(el => el.name == item.name)
            if(!patchedItem){continue}
            patchedItem = duplicate(patchedItem);

            if(item.type == "skill"){
              //Don't patch the whole data, only the description for skills            
              item.update({
                "data.description": patchedItem.data.description,
                "flags": patchedItem.flags,
                "img": patchedItem.img,
                "effects": patchedItem.effects
              }, {})
            } else {
              item.update({
                "data": patchedItem.data,
                "flags": patchedItem.flags,
                "img": patchedItem.img,
                "effects": patchedItem.effects
              }, {})  
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