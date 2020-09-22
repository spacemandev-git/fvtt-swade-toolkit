var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
main();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const l = (key) => { return game.i18n.localize(key); };
        class NPC_Randomizer_Form extends FormApplication {
            constructor(obj = {}, options = {}) {
                super(obj, options);
                // {packID:numRolls}
                this.selectedEdgePacks = {};
                this.selectedHindrancePacks = {};
                this.selectedItemPacks = {};
                this.selectedPowerPacks = {};
            }
            static get defaultOptions() {
                return mergeObject(super.defaultOptions, {
                    id: "npc_randomizer_form",
                    title: "NPC Randomizer",
                    template: "modules/swade-toolkit/templates/npc_randomizer.hbs",
                    width: 400
                });
            }
            getData() {
                let data = {
                    actorList: game.actors.entities,
                    packs: game.packs.entries,
                    actors: game.actors.entries
                };
                return data;
            }
            activateListeners(html) {
                return __awaiter(this, void 0, void 0, function* () {
                    $(html).find("#buildActor").click(() => __awaiter(this, void 0, void 0, function* () {
                        let actorItems = [];
                        console.debug(this.selectedEdgePacks);
                        console.debug(Object.keys(this.selectedEdgePacks));
                        Object.keys(this.selectedEdgePacks).forEach((packID) => __awaiter(this, void 0, void 0, function* () {
                            console.log("Pack: ", packID);
                            let content = yield game.packs.get(packID).getContent();
                            for (let i = 0; i < parseInt(this.selectedEdgePacks[packID]); i++) {
                                actorItems.push(content[Math.floor(Math.random() * content.length)]);
                            }
                        }));
                        /*
                        Object.keys(this.selectedHindrancePacks).forEach(async (packID) => {
                          let pack = game.packs.get(packID);
                          let content = await pack.getContent();
                          for(let i = 0; i<this.selectedEdgePacks[packID]; i++ ){
                            actorItems.push(content[Math.floor(Math.random() * content.length)])
                          }
                        })
                
                        Object.keys(this.selectedPowerPacks).forEach(async (packID) => {
                          let pack = game.packs.get(packID);
                          let content = await pack.getContent();
                          for(let i = 0; i<this.selectedEdgePacks[packID]; i++ ){
                            actorItems.push(content[Math.floor(Math.random() * content.length)])
                          }
                        })
                
                        Object.keys(this.selectedItemPacks).forEach(async (packID) => {
                          let pack = game.packs.get(packID);
                          let content = await pack.getContent();
                          for(let i = 0; i<this.selectedEdgePacks[packID]; i++ ){
                            actorItems.push(content[Math.floor(Math.random() * content.length)])
                          }
                        })
                        */
                        let newActor = duplicate(game.actors.get(html.find("#actorTemplate")[0].value));
                        newActor.data.name = html.find("#actorName")[0].value;
                        newActor.data['items'] = actorItems;
                        Actor.create(newActor);
                    }));
                    $(html).find("#edgePacks").click(() => __awaiter(this, void 0, void 0, function* () {
                        let dialogTemplate = yield renderTemplate('modules/swade-toolkit/templates/npc_randomizer_select_pack.hbs', {
                            //@ts-ignore
                            rollPacks: game.packs.entries.map(pack => {
                                console.log("PACK: ", pack);
                                return {
                                    name: pack.title,
                                    collection: pack.collection,
                                    value: this.selectedEdgePacks[pack.collection] ? this.selectedEdgePacks[pack.collection] : 0
                                };
                            })
                        });
                        new Dialog({
                            title: l("NPC_Randomizer.EdgePackSelection"),
                            content: dialogTemplate,
                            buttons: {
                                save: {
                                    label: l("NPC_Randomizer.Save"),
                                    callback: (html) => __awaiter(this, void 0, void 0, function* () {
                                        for (let packID of game.packs.map(el => { return el.collection; })) {
                                            console.log("PACKID: ", packID);
                                            let newVal = html.find(`#${packID}`)[0].value;
                                            this.selectedEdgePacks[packID] = newVal;
                                        }
                                    })
                                }
                            }
                        }).render(true);
                    }));
                    $(html).find("#hindrancePacks").click(() => __awaiter(this, void 0, void 0, function* () {
                        let dialogTemplate = yield renderTemplate('modules/swade-toolkit/templates/npc_randomizer_select_pack.hbs', {
                            //@ts-ignore
                            rollPacks: game.packs.entries.map(pack => {
                                return {
                                    name: pack.title,
                                    collection: pack.collection,
                                    value: this.selectedHindrancePacks[pack.collection] ? this.selectedHindrancePacks[pack.collection] : 0
                                };
                            })
                        });
                        new Dialog({
                            title: l("NPC_Randomizer.HindrancePackSelection"),
                            content: dialogTemplate,
                            buttons: {
                                save: {
                                    label: l("NPC_Randomizer.Save"),
                                    callback: (html) => __awaiter(this, void 0, void 0, function* () {
                                        for (let packID of game.packs.map(el => { return el.collection; })) {
                                            let newVal = html.find(`#${packID}`)[0].value;
                                            this.selectedHindrancePacks[packID] = newVal;
                                        }
                                    })
                                }
                            }
                        }).render(true);
                    }));
                    $(html).find("#powerPacks").click(() => __awaiter(this, void 0, void 0, function* () {
                        let dialogTemplate = yield renderTemplate('modules/swade-toolkit/templates/npc_randomizer_select_pack.hbs', {
                            //@ts-ignore
                            rollPacks: game.packs.entries.map(pack => {
                                return {
                                    name: pack.title,
                                    collection: pack.collection,
                                    value: this.selectedPowerPacks[pack.collection] ? this.selectedPowerPacks[pack.collection] : 0
                                };
                            })
                        });
                        new Dialog({
                            title: l("NPC_Randomizer.PowerPackSelection"),
                            content: dialogTemplate,
                            buttons: {
                                save: {
                                    label: l("NPC_Randomizer.Save"),
                                    callback: (html) => __awaiter(this, void 0, void 0, function* () {
                                        for (let packID of game.packs.map(el => { return el.collection; })) {
                                            let newVal = html.find(`#${packID}`)[0].value;
                                            this.selectedPowerPacks[packID] = newVal;
                                        }
                                    })
                                }
                            }
                        }).render(true);
                    }));
                    $(html).find("#itemPacks").click(() => __awaiter(this, void 0, void 0, function* () {
                        let dialogTemplate = yield renderTemplate('modules/swade-toolkit/templates/npc_randomizer_select_pack.hbs', {
                            //@ts-ignore
                            rollPacks: game.packs.entries.map(pack => {
                                return {
                                    name: pack.title,
                                    collection: pack.collection,
                                    value: this.selectedItemPacks[pack.collection] ? this.selectedItemPacks[pack.collection] : 0
                                };
                            })
                        });
                        new Dialog({
                            title: l("NPC_Randomizer.ItemPackSelection"),
                            content: dialogTemplate,
                            buttons: {
                                save: {
                                    label: l("NPC_Randomizer.Save"),
                                    callback: (html) => __awaiter(this, void 0, void 0, function* () {
                                        for (let packID of game.packs.map(el => { return el.collection; })) {
                                            let newVal = html.find(`#${packID}`)[0].value;
                                            this.selectedItemPacks[packID] = newVal;
                                        }
                                    })
                                }
                            }
                        }).render(true);
                    }));
                });
            }
        }
        let randomizer = new NPC_Randomizer_Form();
        randomizer.render(true);
    });
}
