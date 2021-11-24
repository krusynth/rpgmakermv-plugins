//=============================================================================
// Kru_UserSwap.js
//=============================================================================

/*:
 * @plugindesc Swaps parties on map change.
 * @author Krusynth
 *
 * @help This plugin extends Hime's Party Manager to automatically swap parties
 * on map load.  Simply add a Note to the map such as <party:2> and that party
 * will automatically be selected on map load.
 *
 * This also adds an event handler when the Party is changed. This allows you
 * to set values on each swap.  For instance, you can create an event and run a
 * custom script like the following to turn Stepping on and off when that party
 * loads.
 *
 * Party.on(1, 'switch', '$gamePlayer._stepAnime = false;');
 * Party.on(2, 'switch', '$gamePlayer._stepAnime = true;');
 */

var Kru = Kru || {};
Kru.US = {
};

// Automatically switch parties on transfer if the map has a party tag.
Kru.US.Game_Player__performTransfer = Game_Player.prototype.performTransfer;
Game_Player.prototype.performTransfer = function() {
  if(
    $dataMap.meta &&
    typeof $dataMap.meta.party !== 'undefined' &&
    $gameParties._activeId !== $dataMap.meta.party
  ) {
    if (this.isTransferring()) {
      let mapId = $gameMap.mapId();
      if(this._newMapId !== $gameMap.mapId()) {
        mapId = this._newMapId;
      }

      $gameParties._parties[$dataMap.meta.party].setLocation(mapId, this._newX, this._newY);
      Party.switch($dataMap.meta.party);

    }
  }
  Kru.US.Game_Player__performTransfer.call(this);
}

// Add event handler to Party.
Party.on = function(id, event, fn) {
  return $gameParties._parties[id].on(event, fn);
}

Kru.US.Game_Party__initialize = Game_Party.prototype.initialize;
Game_Party.prototype.initialize = function() {
  Kru.US.Game_Party__initialize.call(this);
  this.__events = {};
}

Game_Party.prototype.on = function(event, fn) {
  if(typeof this.__events[event] === 'undefined') {
    this.__events[event] = [];
  }

  this.__events[event].push(fn);
}

Game_Party.prototype.onSwitch = function(fn) {
  this.on('switch', fn);
}

Game_Party.prototype.trigger = function(event) {
  if(this.__events[event] && this.__events[event].length) {
    this.__events[event].forEach(fn => {
      eval(fn);
    });
  }
}

Kru.US.Game_Parties__switchParty = Game_Parties.prototype.switchParty;
Game_Parties.prototype.switchParty = function(id) {
  let party = Kru.US.Game_Parties__switchParty.call(this, id);
  party.trigger('switch');
  return party;
};