/*:
 * Vehicle Insides
 *
 * @plugindesc 1.0 Automatically creates vehicle insides,
 *
 * @author Krues8dr (krues8dr.com)
 *
 * @help
 * This plugin allows you to easily create maps for the insides of vehicles,
 * like the Big Whale in Final Fantasy IV or the airships in Final Fantasy VI.
 *
 * You don't need to setup any fancy transfers to get started, your map only
 * needs to be named the same as the vehicle you're using it for (.e.g airship).
 *
 * To take off, create an event that the player can interact with (such as a
 * steering wheel or controls) to trigger this custom script:
 *   Kru.VI.launchVehicle();
 *
 * You can also create an exit from the vehicle back to the main map with the
 * custom script:
 *   Kru.VI.leaveVehicle();
 *
 * To customize where the player starts on the new map, you can add a Note to
 * the map, with the x & y coordinates of the player, and (optionally) the
 * direction they will be facing :
 *   <start:x,y,d>
 *
 * Terms & Conditions
 * This plugin is MIT Licensed. (Free for non-commercial and commercial use.)
 */

var Imported = Imported || {};
Imported.Kru_VehicleInsides = 1.0;

var Kru = Kru || {};
Kru.VI = {
  'loaded': false,
  'vehicles': {
    'boat': {},
    'ship': {},
    'airship': {}
  },
  'previousLocation': null
};

/*** Helpers ***/
if(!Kru.helpers) {
  Kru.helpers = {}
}

Kru.helpers.getMapData = function(mapId) {
  var filename = 'Map%1.json'.format(mapId.padZero(3));
  return this.getFileData(filename);
};

// Gets data from a JSON file.
// Unlike the original version, this is synchronous and returns the result.
Kru.helpers.getFileData = function(src) {
  var data;

  var xhr = new XMLHttpRequest();
  var url = 'data/' + src;
  xhr.open('GET', url, false);
  xhr.overrideMimeType('application/json');
  xhr.onload = function() {
    if (xhr.status < 400) {
        data = JSON.parse(xhr.responseText);
        DataManager.extractMetadata(data);
    }
  };
  xhr.onerror = function() {
      DataManager._errorUrl = DataManager._errorUrl || url;
  };
  xhr.send();

  return data;
 }

DataManager.Kru__isDatabaseLoadedOriginal = DataManager.isDatabaseLoaded;
DataManager.isDatabaseLoaded = function() {
  if (!DataManager.Kru__isDatabaseLoadedOriginal()) {
    return false;
  }
  else if(!Kru.VI.loaded) {
    // Loop through all maps and match to vehicle names.
    for(var i = 0; i < $dataMapInfos.length; i++) {
      var map = $dataMapInfos[i];
      if(map instanceof Object && map.name) {
        var name = map.name.toLowerCase();

        if(Object.keys(Kru.VI.vehicles).indexOf(name) > -1) {
          Kru.VI.vehicles[name].map = $dataMapInfos[i];
          var mapData = Kru.helpers.getMapData($dataMapInfos[i].id);
          Kru.VI.vehicles[name].map.meta = mapData.meta;
        }
      }
    }
    Kru.VI.loaded = true;
  }
  return true;
};


// Replace waitCount() with a function that calls a callback.
Game_Interpreter.prototype.registerWaitCallback = function(event, callback) {
  this.__waitCallback = this.__waitCallback || {};
  this.__waitCallback[event] = this.__waitCallback[event] || [];
  this.__waitCallback[event].push(callback);
};

Game_Interpreter.prototype.waitCallback = function(event) {
  this.__waitCallback = this.__waitCallback || {};
  this.__waitCallback[event] = this.__waitCallback[event] || [];

  while(this.__waitCallback[event].length) {
    this.__waitCallback[event].shift()();
  }
};

Game_Interpreter.prototype.Kru__updateWaitCountOriginal = Game_Interpreter.prototype.updateWaitCount;

Game_Interpreter.prototype.updateWaitCount = function() {
    var prevVal = this._waitCount;
    var returnVal = this.Kru__updateWaitCountOriginal();

    if(prevVal > 0 && this._waitCount === 0) {
      this.waitCallback(this._waitMode);
    }

    return returnVal;
};

// Transfer helper that allows a callback after the transfer.
Kru.helpers.transfer = function(mapId, x, y, direction, transition, callback) {
  if(callback) {
    $gameMap._interpreter.registerWaitCallback('transfer', callback);
  }

  $gameMap._interpreter.setWaitMode('transfer');
  $gamePlayer.reserveTransfer(
    parseInt(mapId),
    parseInt(x),
    parseInt(y),
    parseInt(direction),
    parseInt(transition)
  );
}

/*** End Helpers ***/


/* Vehicle */

// Game_Vehicle.prototype.Kru__getOnOriginal = Game_Vehicle.prototype.getOn;

// Game_Vehicle.prototype.getOn = function() {
//   $gameSystem.saveWalkingBgm();
//   this.playBgm();
// };


Game_Player.prototype.Kru__getOnVehicleOriginal = Game_Player.prototype.getOnVehicle;

Game_Player.prototype.getOnVehicle = function() {
 if (!this.areFollowersGathering() && !this.isMoving()) {
    var direction = this.direction();
    var x1 = this.x;
    var y1 = this.y;
    var x2 = $gameMap.roundXWithDirection(x1, direction);
    var y2 = $gameMap.roundYWithDirection(y1, direction);

    var vehicleType;
    var vehicleId = -1;

    if ($gameMap.airship().pos(x1, y1)) {
        vehicleType = 'airship';
        vehicleId = 2;
    } else if ($gameMap.ship().pos(x2, y2)) {
        vehicleType = 'ship';
        vehicleId = 1;
    } else if ($gameMap.boat().pos(x2, y2)) {
        vehicleType = 'boat';
        vehicleId = 0;
    }

    // Check for map
    if(vehicleType && Kru.VI.vehicles[vehicleType].map) {
      Kru.VI.previousLocation = {
        'id': $gameMap._mapId,
        'x': this._x,
        'y': this._y,
        'd': this._direction,
        'vehicle': [vehicleType, vehicleId]
      };

      var map = Kru.VI.vehicles[vehicleType].map;

      var start = [];
      if(map.meta.start) {
        start = map.meta.start.split(',');
      }

      var startx = start[0] || 0;
      var starty = start[1] || 0;
      var direction = start[2] || 0;
      var transition = start[3] || 0;

      Kru.helpers.transfer(map.id, startx, starty, direction, transition);

      return false;
    }
    else {
      return this.Kru__getOnVehicleOriginal();
    }
  }
}


Kru.VI.leaveVehicle = function() {
  if(Kru.VI.previousLocation) {
    Kru.helpers.transfer(
      Kru.VI.previousLocation.id,
      Kru.VI.previousLocation.x,
      Kru.VI.previousLocation.y,
      Kru.VI.previousLocation.d,
      0
    );
  }
}

Kru.VI.launchVehicle = function() {
  if(Kru.VI.previousLocation) {
    $gameScreen.startFadeOut($gameMap._interpreter.fadeSpeed());
    $gameMap._interpreter.wait($gameMap._interpreter.fadeSpeed());

    var afterTransfer = function() {
      $gameScreen.startFadeIn($gameMap._interpreter.fadeSpeed());
      $gameMap._interpreter.wait($gameMap._interpreter.fadeSpeed());

      $gamePlayer.Kru__getOnVehicleOriginal();
    };

    Kru.helpers.transfer(
      Kru.VI.previousLocation.id,
      Kru.VI.previousLocation.x,
      Kru.VI.previousLocation.y,
      Kru.VI.previousLocation.d,
      0,
      afterTransfer
    );
  }
}
