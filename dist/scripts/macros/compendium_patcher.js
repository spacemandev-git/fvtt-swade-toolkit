var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
compendium_patcher();
function compendium_patcher() {
    return __awaiter(this, void 0, void 0, function* () {
        const l = (key) => { return game.i18n.localize("Compendium_Patcher." + key); };
        class Compendium_Patcher_Form extends FormApplication {
            constructor() {
                super({}, {});
            }
            static get defaultOptions() {
                return mergeObject(super.defaultOptions, {
                    id: "compendium_patcher_form",
                    title: l("Compendium_Patcher"),
                    template: "modules/swade-toolkit/templates/macros/compendium_patcher.hbs",
                    width: 400,
                    closeOnSubmit: false
                });
            }
            getData() {
                return {
                    folders: game.folders.filter(folder => folder.type == "Actor"),
                    packs: game.packs.filter(pack => pack.entity == "Item")
                };
            }
            _updateObject(_evt, _data) {
                return __awaiter(this, void 0, void 0, function* () {
                    const patchActors = (data) => __awaiter(this, void 0, void 0, function* () {
                        console.log("Patching!");
                        console.log(data);
                        //@ts-ignore
                        let actors = game.folders.get(data.actorFolder).content;
                        let allItems = [];
                        let packs = game.packs.map((pack) => {
                            if (data[pack.collection] == true) {
                                return pack;
                            }
                        })
                            .filter(el => el != undefined);
                        for (let pack of packs) {
                            allItems = allItems.concat(yield pack.getContent());
                        }
                        for (let actor of actors) {
                            for (let item of actor.items) {
                                let patchedItem = allItems.find(el => el.name == item.name);
                                if (!patchedItem) {
                                    continue;
                                }
                                patchedItem = duplicate(patchedItem);
                                if (item.type == "skill") {
                                    //Don't patch the whole data, only the description for skills            
                                    item.update({
                                        "data.description": patchedItem.data.description,
                                        "flags": patchedItem.flags,
                                        "img": patchedItem.img,
                                        "effects": patchedItem.effects
                                    }, {});
                                }
                                else {
                                    item.update({
                                        "data": patchedItem.data,
                                        "flags": patchedItem.flags,
                                        "img": patchedItem.img,
                                        "effects": patchedItem.effects
                                    }, {});
                                }
                            }
                        }
                    });
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
                                                callback: () => { patchActors(_data); }
                                            }
                                        }
                                    }).render(true);
                                }
                            }
                        }
                    }).render(true);
                });
            }
        }
        new Compendium_Patcher_Form().render(true);
    });
}
