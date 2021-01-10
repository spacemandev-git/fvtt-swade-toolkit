# API

## Hooks  
- swade-toolkit-handlers-ready  
  Called when the handlers are done initializing, does not contain any parameters

## Triggers
- ItemAction

## Transformers 
- ItemAction transformers should make use of the "modifiers" property on roll object to add descriptions of modifiers and their value for flavor text like so:
```js
[
  {"description": "Cover Bonus", "value": "+4"}
]
```
- ItemAction can make use of the "chatMessage" property on the roll object to overwrite the ChatMessage content

## Util
game.automation.util
  - getSwadeAction(item, actionId) returns a SwadeAction
  ```ts
  export interface SwadeAction{
    name: string,
    type: "skill" | "damage",
    skill?: string,
    damage?: string,
    skillMod?: string,
    dmgMod?:string,

    rof?: number, 
    shotsUsed?:number,
  }
  ```


/*
interface ITransformer {
  name: string,
  isActive: boolean,
  entityID: string | "*",
  entityType: "Token" | "Actor" | "Scene" | "JournalEntry" | "RollTable",
  duration: number, //in seconds
  trigger: string,
  execOrderNum: number,
  description: string,
  transformer: string //eval this to get the transformer function
}
*/


//should return a list of default transformers

//Combat (100 - 200 Run Order)
// Range Penalty
// Multi Action Penalty
// Cover Penalty
// Recoil
// Unstable Platform
// Double Tap Edge
// Target Parry/Toughness
// Gritty Damage
// ReRoll w/ Benny
// Showing hit/raise/ and apply wounds

//SWADE Tools
// Auto roll initiative when combat starts
// Distribute bennies automatically when a joker is drawn
// Add +2 Bonus when a character has a joker
// Link status icons to sheet conditions
// Manage status automatically during combat. Rolls to remove Stunned and Shaken. Remove Vuln/Distracted at end of turn. Show warn for Entangled/Bound
// Show a button to reroll any roll with a benny
// 


//TODO:
// dice so nice support
// custom chat cards 
// wildcard transformers are breaking right now
// WC transformers should be added as Token Transformers on token creation?
// Change Info View to Edit