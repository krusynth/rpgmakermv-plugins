//=============================================================================
// Kru_MapLoadEvents.js
//=============================================================================

/*:
 * @plugindesc Runs scripts on map change.
 * @author Krues8dr
 *
 * @help This plugin allows for custom javascript to be run on map load. Add a
 * load tag and follow it with whatever code you want to execute.
 *
 * Example:
 * <load:console.log("test ABC");>
 *
 * TODO: Add global events.
 *

 */

var Kru = Kru || {};
Kru.MLE = {
};

// Automatically switch parties on transfer if the map has a party tag.
Kru.MLE.Game_Player__performTransfer = Game_Player.prototype.performTransfer;
Game_Player.prototype.performTransfer = function() {
  if(
    $dataMap.meta &&
    typeof $dataMap.meta.load !== 'undefined'
  ) {
    eval($dataMap.meta.load);
  }
  Kru.MLE.Game_Player__performTransfer.call(this);
}
