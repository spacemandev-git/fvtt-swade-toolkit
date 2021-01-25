[![ko-fi](https://www.ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/K3K11VCDK)  
Please consider making a one time or recurring contribution to help continue to fuel module updates. Ko-Fi contributions are one of the positive ways I actually know if what I write is being used and if it's valuable for the community. 

# Changelog
### 1.1.2
- Thanks to @Javierriveracastro for adding code for fatigue and wound icons
- Fixed bug with 0.16 of SWADE that opened skill sheets on AE toggle
- _Hopefully_ fixed the manifest problem
- Fixed the hidden and show classes overwriting core foundry classes (this would mess up the combat tracker hidden feature for example)

### 1.1.1
- Active Effects on skills now apply when you drag + drop an item onto the sheet, and can handle both die and modifier on the same skill in the same effect
### 1.1.0
- Active Effects on Skills: If you toggle this setting on, you can create active effects on skills by setting the value to "m!Skillname" to change the modifier of a skill or "d!Skillname" for die type. It's only additive, so if you want to *reduce* the value, use a negative number.
- Status Effects linking: If you turn this setting on, tokens will sync their core statuses (Shaken, Stunned, Bound, Entangled, Vulnerable, Distracted) between the token and the sheet (switching on one will switch on the other, and vice versa). 

### 1.0.2
- Compendium Patcher upgraded to fuzzy match Hindrances for better compatibility with savaged us importer.

### 1.0.1
- Compendium Patcher issue #1 and #4 fixed (arcane background for powers preserved, and patched items replaced by old ones after reload)
- Updated Foundry compatible version to 0.79

### 1.0
- NPC Randomizer Inital Release
- Compendium Patcher Inital Release

# Description
SWADE Toolkit is the successor for SWADE Macros Simple. It includes a variety of tools (both macros and other more complicated Quality of Life improvements) that help with making the SWADE experience just a little bit better. 

All the features can be toggled on/off in the settings. If you have a problem with anything, please ask in the #swade channel in the Foundry Discord. 

## NPC Randomizer

![NPC_Randomizer](readme_assets/npc_randomizer.png)

Select an actor template, pick compendiums to roll on, and it'll populate the actor with random items. It'll keep everything from the template except anything the SWADE system considers an "item"

## Compendium Patcher

![Compendium_Patcher](readme_assets/compendium_patcher.png)

Pick a folder of actors, pick compendiums to use to patch them.
It'll go through each actor, and if it finds an item in the compendiums you've selected that matches the name of the actor's item, it'll replace it with the compendium item.

It will preserve skills die types.

Useful for updating descriptions and other info for imported actors that you might otherwise have as extensive compendiums.


# License
MIT License. Do what you will. PRs welcome. 
