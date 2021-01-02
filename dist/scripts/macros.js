var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Hooks.on("ready", () => __awaiter(this, void 0, void 0, function* () {
    //Check if Macros with given name exist, if not, create them
    let macros = (yield FilePicker.browse("data", "modules/swade-toolkit/scripts/macros/")).files;
    console.log("SWADE TOOLKIT| Macros Found: ", macros);
    for (let macroName of macros) {
        let name = macroName.split("/").pop().split('.js')[0];
        game.settings.register("swade-toolkit", `${name}-enabled`, {
            name: `${name} Enabled`,
            label: `${name} Enabled`,
            type: Boolean,
            default: false,
            config: true,
            onChange: (newSetting) => {
                console.log(newSetting);
                location.reload();
            }
        });
        if (!game.settings.get("swade-toolkit", `${name}-enabled`)) {
            continue; //skip to next iteration of the for loop if module isn't enabled
        }
        if (game.macros.find(el => el.name == name) != undefined) {
            //macro exist. update it
            game.macros.find(el => el.name == name).update({
                "command": yield (yield fetch(macroName)).text(),
                "img": `modules/swade-toolkit/assets/${name}.png`
            });
        }
        else {
            //macro doesnt' exist, create it
            Macro.create({
                name: name,
                type: "script",
                scope: "global",
                command: yield (yield fetch(macroName)).text(),
                img: `modules/swade-toolkit/assets/${name}.png`,
            });
        }
    }
}));
