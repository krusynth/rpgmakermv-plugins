//=============================================================================
// Game Seed
// Version: 1.0.0
//=============================================================================
/*:
 * @plugindesc v1.0.0 Creates a custom random seed for the game.
 *
 * @author Krues8dr
 *
 * @param Seed Variable Name
 * @desc Select the variable that should hold the seed.
 * @type variable
 *
 * @help
 * ============================================================================
 * Information
 * ============================================================================
 *
 * This plugin creates a random number to associate with the current game. This
 * number is only set once per game, so it can be used to create stable events.
 * Combine this with Hime's Custom Page Conditions to randomize parts of maps!
 *
 * Usage example:
 *
 * To have an event show up randomly, use Custom Page Conditions with
 *
 * Terms & Conditions
 * This plugin is free for non-commercial and commercial use.
 */

var Imported = Imported || {};
Imported.Kru_GS = "1.0.0";

var Kru = Kru || {};
Kru.GS = {
  config: {}
};

Kru.GS.Parameters = PluginManager.parameters('Kru_GameSeed');
Kru.GS.SeedVar = Kru.GS.Parameters['Seed Variable Name'];

Kru.GS.generateSeed = function () {
  return Math.floor(Math.random() * 100000000);
}

// Usage
Kru.GS.seedTest = function(num, position) {
  let value = $gameVariables._data[Kru.GS.SeedVar];

  if(num) {
    if(position) {
      value = Math.floor( value / (10 ** position) );
    }

    return value % num;
  }
  return;
}
// Shortcut
var seedTest = Kru.GS.seedTest;

Kru.GS.setSeed = function() {
  if(typeof $gameVariables._data[Kru.GS.SeedVar] === 'undefined') {
    $gameVariables._data[Kru.GS.SeedVar] = Kru.GS.generateSeed();
  }
}

Kru.GS.DataManager__setupNewGame = DataManager.setupNewGame;
DataManager.setupNewGame = function() {
  Kru.GS.DataManager__setupNewGame.call(this);

  Kru.GS.setSeed();
};

Kru.GS.DataManager__loadGameWithoutRescue = DataManager.loadGameWithoutRescue;
DataManager.loadGameWithoutRescue = function(savefileId) {
  let result = Kru.GS.DataManager__loadGameWithoutRescue.call(this, savefileId);
  Kru.GS.setSeed();

  return result;
};
