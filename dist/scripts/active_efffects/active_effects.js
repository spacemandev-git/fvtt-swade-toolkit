var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Hooks.on("ready", () => {
    game.toolkit = {
        activeEffects: new ActiveEffects()
    };
});
class ActiveEffects {
    constructor() {
        this.registerSettings();
        this.startSkillModListeners();
    }
    registerSettings() {
        game.settings.register("swade-toolkit", "enableSkillsActiveEffects", {
            name: game.i18n.localize("Active_Effects.Enable_Skill_Active_Effects"),
            scope: "world",
            config: true,
            type: Boolean,
            default: false,
        });
    }
    startSkillModListeners() {
        Hooks.on("updateActiveEffect", (actor, effect, disabled, diff, userId) => __awaiter(this, void 0, void 0, function* () {
            if (game.userId != userId || !game.settings.get("swade-toolkit", "enableSkillsActiveEffects")) {
                return;
            }
            if (!effect.changes.find(el => (el.key.includes("d!") || el.key.includes("m!")))) {
                return;
            } //only process the AEs with d! and m!
            for (let change of effect.changes) {
                if (change.key.startsWith("d!")) {
                    if (change.value % 2 != 0) {
                        ui.notifications.error(game.i18n.localize("Active_Effects.Die_Must_Be_Even"));
                        return;
                    }
                    let skillName = change.key.split("d!")[1];
                    let skill = actor.items.find(el => el.name == skillName);
                    if (disabled.disabled) {
                        //AE Turned Off
                        let newSkill = duplicate(skill);
                        newSkill.data.die.sides += change.value;
                        yield actor.deleteOwnedItem(skill.id);
                        actor.createOwnedItem(newSkill);
                    }
                    else {
                        //AE Turned On
                        let newSkill = duplicate(skill);
                        newSkill.data.die.sides += (change.value * -1);
                        yield actor.deleteOwnedItem(skill.id);
                        actor.createOwnedItem(newSkill);
                    }
                }
                else if (change.key.startsWith("m!")) {
                    let skillName = change.key.split("m!")[1];
                    let skill = actor.items.find(el => el.name == skillName);
                    if (disabled.disabled) {
                        //AE Turned Off
                        let newSkill = duplicate(skill);
                        newSkill.data.die.modifier = (parseInt(skill.data.die.modifier) + change.value).toString();
                        yield actor.deleteOwnedItem(skill.id);
                        actor.createOwnedItem(newSkill);
                    }
                    else {
                        //AE Turned On
                        let newSkill = duplicate(skill);
                        newSkill.data.die.modifier = (parseInt(skill.data.die.modifier) - change.value).toString();
                        yield actor.deleteOwnedItem(skill.id);
                        actor.createOwnedItem(newSkill);
                    }
                }
            }
        }));
    }
}
