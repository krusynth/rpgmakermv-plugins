//=============================================================================
// Kru_PreviousPosition.js
//=============================================================================

/*:
 * @plugindesc Stores the player's position and can return the player there.
 * @author Krues8dr
 *
 * @help
 *
 * Usage: Before running a transfer within an event, run this custom script to
 * store the current location: Kru.PP.store();
 *
 * To return to that location, run Kru.PP.recall();  You may automatically
 * change the direction of the player by passing it as an argument.
 */

var Kru = Kru || {};
Kru.PP = {
  location: {}
};

Kru.PP.store = function() {
  this.location = {
    map: $gameMap.mapId(),
    x: $gamePlayer._x,
    y: $gamePlayer._y,
    d: $gamePlayer.direction
  };
}

Kru.PP.transfer = function(map, x, y, d, fade) {
  fade = fade || 0;
  if(map != null) {
    $gamePlayer.reserveTransfer(map, x, y, d, fade);
  }
}

Kru.PP.recall = function(d, fade) {
  d = d || this.location.d;
  Kru.PP.transfer(
    this.location.map,
    this.location.x,
    this.location.y,
    d,
    fade
  );
}

