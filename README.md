# RPG Maker MV Plugins

This is a collection of RPG Maker MV Plugins to add various features to your
game. All of the plugins are free for commercial and non-commercial use,
[licensed under the MIT License](./LICENSE). You do not need to give any sort of
credit to use these plugins in your game.

The following plugins are available in this repo:

## [Clear Map Photos](Kru_ClearMapPhotos.js)
Automatically clears all previously loaded photos whenever a map is loaded. This
makes it easier to have parallax photos on your maps as they'll automatically be
cleaned up.

## [Airship Events](Kru_AirshipEvents.js)
By default, RPG Maker MV doesn't allow airships to interact with events.
This plugin removes that limitation, allowing airships to land in towns, etc.

## [Vehicle Insides](Kru_VehicleInsides.js)
This plugin allows authors to easily create maps for the insides of vehicles, like
the Big Whale in Final Fantasy IV or the airships in Final Fantasy VI. The
player will automatically be transported to the map upon entering the vehicle.

## [Multi-tile Events](Kru_MultitileEvents.js)
This plugin allows for events that are bigger than one tiles, by expanding the
collision box via notes. This works nicely for larger sprites (like giant
monsters) that can still wander around like normal events. *Requires Kru Core.*

## [Map Merge](Kru_MapMerge.js)
Allows authors to merge maps together, replacing a section of a map with a new
map based on a given set of conditions. This is useful for dynamic events where
a part of the map changes dramatically - e.g., a building is destroyed or lots
of new characters appear.

## [Kru Core](Kru_Core.js)
Core library for many of the other plugins so as to not repeatedly re-implement
the same base functionality. The major features currently in this are
streamlined window APIs, line drawing tools, and note tag parsers.

## [Party Window](Kru_PartyWindow.js)
Shows more characters in the status window based on Max Battle Members setting
in Yanfly's Party System.  *Requires Yanfly Party System.*

## [Reputation](Kru_Reputation.js)
A system for keeping track of the reputation of your party across multiple
groups or factions. Allows you to have named values for different reputation
values (e.g. "Known", "Famous", etc.). Works with builtin variables for ease of
use. Also allows discounts at shops based on your reputation. You can even have
special graphics for each group or faction. *Requires Kru Core.* [wiki/Kru_Reputation](documentation) [demo](https://games.krues8dr.com/demo/Kru_Reputation/)

## [Skill Tree](Kru_SkillTree.js)
*work in progress*

Adds Skill Points (optionally awarded on level up) that can be used to purchase
skills. Skills can also have multiple levels. *Requires Kru Core.*

## [Assign Stats](Kru_AssignStats.js)
*work in progress*

Adds Stat Points (optionally awarded on level up) that can be used to improve
attributes (Attack, Defense, Luck, etc.).  Traditional class-based level up stat
points can also be disabled entirely. *Requires Kru Core.*

## [Class Change](Kru_ClassChange.js)
*work in progress*

Automatically triggers class change when certain conditions are met. Currently
only checks on level up or when assinging stats with the Assign Stats plugin.
*Requires Kru Core.*

## [Demo](Kru_Demo.js)
This plugin makes it easier to deploy multiple games on a single webserver, by
allowing each instance to share the core game assets. It also allows you to
specify a custom html container element for the game to load in, so that you
can create a wrapper frame around the game. [demo](https://games.krues8dr.com/demo/Kru_Reputation/)