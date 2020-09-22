var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
npc_radomizer();
function npc_radomizer() {
    return __awaiter(this, void 0, void 0, function* () {
        const l = (key) => { return game.i18n.localize("NPC_Randomizer." + key); };
        class NPC_Randomize_Form extends FormApplication {
            constructor(obj = {}, options = {}) {
                super(obj, options);
                this.selectedPacks = [];
            }
            static get defaultOptions() {
                return mergeObject(super.defaultOptions, {
                    id: "npc_randomizer_form",
                    title: l("NPC_Randomizer"),
                    template: "modules/swade-toolkit/templates/npc_randomizer.hbs",
                    width: 400,
                    closeOnSubmit: false
                });
            }
            getData() {
                return {
                    actors: game.actors.entries,
                    //@ts-ignore
                    packs: game.packs.entries.filter(el => el.entity == "Item")
                };
            }
            _updateObject(evt, data) {
                return __awaiter(this, void 0, void 0, function* () {
                    //console.log(evt)
                    console.log(data);
                    let items = [];
                    //@ts-ignore
                    for (let pack of game.packs.entries.filter(el => el.entity == "Item")) {
                        if (data[pack.collection] > 0) {
                            let packContent = yield pack.getContent();
                            if (data[pack.collection] > packContent.length) {
                                ui.notifications.error(`${pack.title} only has (${packContent.length}) entries and you're trying to roll on it (${data[pack.collection]}) times`);
                                return;
                            }
                            let packItems = [];
                            for (let i = 0; i < data[pack.collection]; i++) {
                                let newItem = packContent[Math.floor(Math.random() * packContent.length)];
                                while (packItems.find(item => item.name == newItem.name)) {
                                    newItem = packContent[Math.floor(Math.random() * packContent.length)];
                                }
                                packItems.push(newItem);
                                items.push(newItem); //Concat Didn't work for some reason :shrug:
                            }
                        }
                    }
                    let newActor = yield Actor.create(duplicate(game.actors.find((actor) => actor.id == data.actorTemplate)));
                    newActor.update({
                        "name": data.actorName,
                        "items": items
                    });
                });
            }
        }
        new NPC_Randomize_Form().render(true);
    });
}
