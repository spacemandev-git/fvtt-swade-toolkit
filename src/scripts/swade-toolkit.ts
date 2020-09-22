Hooks.on("ready", async () => {
  //Check if Macros with given name exist, if not, create them
  let macros = (await FilePicker.browse("data", "modules/swade-toolkit/scripts/macros/")).files
  console.log("SWADE TOOLKIT| Macros Found: ", macros)

  for(let macroName of macros){
    let name = macroName.split("/").pop().split('.js')[0];
    game.settings.register("swade-toolkit", `${name}-enabled`, {
      name: `${name} Enabled`,
      label: `${name} Enabled`,
      type: Boolean,
      default: false,
      config: true,
      onChange: (newSetting:boolean) => {
        console.log(newSetting)
        location.reload();
      }
    })

    if(!game.settings.get("swade-toolkit", `${name}-enabled`)){
      continue;  //skip to next iteration of the for loop if module isn't enabled
    }

    if(game.macros.find(el => el.name == name) != undefined){
      //macro exist. update it
      game.macros.find(el => el.name == name).update({
        "command": await (await fetch(macroName)).text(),
        "img": `modules/swade-toolkit/assets/${name}.png`
      })
    } else {
      //macro doesnt' exist, create it
      Macro.create({
        name: name,
        type: "script",
        scope: "global",
        command: await (await fetch(macroName)).text(),
        img: `modules/swade-toolkit/assets/${name}.png`,
      })
    }
  }
})