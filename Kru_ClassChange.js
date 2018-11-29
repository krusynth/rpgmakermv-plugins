//=============================================================================
// Class Change
// Version: 1.0.0
//=============================================================================
/*:
 * @plugindesc v1.0.0 Allows for class change on level up and stat increases.
 *
 * @author Krues8dr
 *
 * @help
 * ============================================================================
 * Information
 * ============================================================================
 *
 * This plugin allows players to automatically change class when particular
 * requirements are met.
 *
 * This plugin seamlessly interacts with Kru_AssignStats.
 *
 * Usage
 * Add a line to the class' notes field with a JSON object in the following
 * format:
 * {"req":{"level":10,"class":"Fighter","attr":{"atk":25,"def":15}}}
 *
 * In this example, the class change will happen on level up when the player is
 * at least level 10, currently has the Fighter class, and has a minimum Attack
 * attribute of 25 and Defense of 15.
 *
 * Terms & Conditions
 * This plugin is free for non-commercial and commercial use.
 */

/*
 * TODO: remap RPG Maker MV math to use the new stats.
 */

var Imported = Imported || {};
Imported.Kru_ClassChange = "1.0.0";

var Kru = Kru || {};
Kru.CC = {
  config: {}
};

if(!Imported.Kru_Core) {
  alert("Kru_StatOverhaul requires Kru_Core.");
  throw new Error("Kru_StatOverhaul requires Kru_Core.");
}

/*
 * Setup our classes to upgrade automatically.
 */
Kru.CC.DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
DataManager.isDatabaseLoaded = function() {
  Kru.CC.DataManager_isDatabaseLoaded.call(this);
  Kru.helpers.processNotes('classes');
  return true;
};

// Level up
Kru.CC.Game_Actor_levelUp = Game_Actor.prototype.levelUp;
Game_Actor.prototype.levelUp = function () {
  Kru.CC.Game_Actor_levelUp.call(this);

  // After our level up, check if we should change class.
  this.checkClassChange();
};

/*
 * If we're using the assign stats plugin, do class change on stat change.
 */
if(Imported.Kru_AssignStats) {
  Kru.CC.Kru_StatusWindow__onOk = Kru_StatusWindow.prototype.onOk;
  Kru_StatusWindow.prototype.onOk = function() {
    Kru.CC.Kru_StatusWindow__onOk.call(this);

    // After we've updated our attributes, check to see if we need to change class.
    this.checkClassChange();
  }
}

Kru_StatusWindow.prototype.checkClassChange = function() {
  var currentClass = $dataClasses[this.actor._classId];

  classCheck: for(hCC_i = 0; hCC_i < $dataClasses.length; hCC_i++) {
    if(hCC_i != this.actor._classId) {
      var cls = $dataClasses[hCC_i];

      if(typeof(cls) === 'undefined' || cls === null || typeof(cls._notes) === 'undefined') {
        continue classCheck;
      }

      // All class changes have requirements.
      if(cls._notes.req) {

        // Level Check
        if(cls._notes.req.level && this.actor._level < cls._notes.req.level) {
          continue classCheck;
        }

        // Previous Class Check
        if(typeof(cls._notes.req.class) !== 'undefined') {
          if(Array.isArray(cls._notes.req.class) && cls._notes.req.class.indexOf(currentClass.name) === -1){
            continue classCheck;
          }
          if(typeof(cls._notes.req.class) === 'string' && cls._notes.req.class !== currentClass.name) {
            continue classCheck;
          }
        }

        // Attribute Requirements Check
        if(cls._notes.req.attr) {
          var keys = Object.keys(cls._notes.req.attr);
          for(hCC_k = 0; hCC_k < keys.length; hCC_k++) {
            var key = keys[hCC_k];
            var value = cls._notes.req.attr[key];
            if(value < 0) {
              if(this.actor[key] > (0-value)) {
                continue classCheck;
              }
            }
            else {
              if(this.actor[key] < value) {
                continue classCheck;
              }
            }
          }
        }

        // If we have passed all other requirement checks, change class.
        this.doClassChange(cls);

        // Only change class once.
        break;
      }

    }
  }
}

Kru_StatusWindow.prototype.doClassChange = function(cls) {
  this.actor._classId = cls.id;
  this.refresh();

  var msg = this.actor.name() + ' has become a ' + cls.name;

  // Play a sound and show a message.
  $gameMessage.add(msg);

  // TODO: make this customizable.
  // AudioManager.playMe($gameSystem.victoryMe());

  var msgWindow = new Window_Message();
  var newWin = this._win.scene.addWindow(msgWindow);

  setTimeout(function(msgWindow) {
    $gameMessage.clear();
    this._win.scene.removeChild(msgWindow);
    msgWindow.visible = false;

  }.bind(this, msgWindow), 3000);

};
