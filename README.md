# RPG Maker MV Plugins

This is a collection of RPG Maker MV Plugins to add various features to your
game. All of the plugins are free for commercial and non-commercial use,
[licensed under the MIT License](./LICENSE). You do not need to give any sort of
credit to use these plugins in your game.

The following plugins are available in this repo:

## [Variable Text](Kru_VariableText.js)
Replaces text in your game with a value defined in a JSON file. This allows you
to set names of towns, people, etc. in one place and re-use the variable
everywhere.

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
special graphics for each group or faction. *Requires Kru Core.* [documentation](https://github.com/krusynth/rpgmakermv-plugins/wiki/Kru_Reputation) | [demo](https://games.billhunt.dev/demo/Kru_Reputation/)

## [Game Seed](Kru_GameSeed.js)
Creates a custom "seed" number that can be used to create pseudo-random events
that persist across the length of a game. E.g., one of several paths is blocked
by debris, but the path changes each game. [documentation](https://github.com/krusynth/rpgmakermv-plugins/wiki/Kru_GameSeed) | [demo](https://games.billhunt.dev/demo/Kru_GameSeed/)

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
can create a wrapper frame around the game. [demo](https://games.billhunt.dev/demo/Kru_Reputation/)

## [Load Image Types](Kru_LoadImageTypes.js)
This plugin allows for image types other than PNGs to be loaded for most uses.
The default behavior for any files without an extension will remain the RPG
Maker MV default to automatically add ".png" to the end before looking for the
image. However, any files that include an extension will be loaded as-is.

## [Load Map Events](Kru_MapLoadEvents.js)
Runs your own custom javascript when changing between maps.

## [Pipe Minigame](Kru_PipeMinigame.js)
*work in progress*

A small minigame where the player must connect a series of pipes. This plugin is
currently under development, but works. There is no time limit or other
restrictions currently. *Requires Kru Core.*

To use this, you'll need to create an image for the tiles of the game. You can
use [this image](https://raw.githubusercontent.com/wiki/krusynth/rpgmakermv-plugins/img/Kru_PipeMinigame/pipetiles.png)
or use it as a template.

## [Previous Position](Kru_PreviousPosition.js)
Remember a location and transfer the player back to that location.


# Additions for other authors' plugins

## [Modern Algebra Extra Movement Frames](Kru_ExtraMovementFramesPatch.js)
This plugin extends [Modern Algebra's Extra Movement Frames](http://rmrk.net/index.php?topic=50452.0)
to fix an issue with the default filename pattern, which breaks on the web due
to the use of the `%` character.  Allows users to set their own regex patterns.

## [SumRndmDde FaceImages](Kru_SRD_FaceImages.js)
This is a very tiny plugin that overrides the bust images of
[SRD_AltMenuScreen_BustIcons.js](http://sumrndm.site/ams-busts-icons/) to use
the built-in RPG Maker MV standard face images instead.

## [Hime User Swap](Kru_UserSwap.js)
This plugin extends [Hime's Party Manager](http://himeworks.com/2016/02/party-manager-mv/)
to automatically swap parties on map load.  Simply add a Note to the map such as
`<party:2>` and that party will automatically be selected on map load. This also
adds an event handler when the Party is changed. This allows you to set values
on each swap.  For instance, you can create an event and run a custom script to
turn Stepping on and off when that party loads.

## [Battle Movement Frames](Kru_BattleMovementFrames.js)
*work in progress*

Adds movement frames to an enemy sprite in battle. This doesn't handle attacks
or anything complicated - you're better off using
[Yanfly's Animated Sideview Enemies](http://www.yanfly.moe/wiki/Animated_Sideview_Enemies_%28YEP%29)
if you're looking for that sort of animation. *Requires Kru Core.*
