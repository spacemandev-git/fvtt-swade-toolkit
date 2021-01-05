# API

## Hooks  
- swade-toolkit-handlers-ready  
  Called when the handlers are done initializing, does not contain any parameters

## Triggers
- ItemAction

## Transformers 
- ItemAction transformers should make use of the "modifiers" property on roll object to add descriptions of modifiers and their value for flavor text like so:
```
[
  {"description": "Cover Bonus", "value": "+4"}
]
```
- ItemAction can make use of the "chatMessage" property on the roll object to overwrite the ChatMessage content