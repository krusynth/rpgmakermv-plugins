//=============================================================================
// Assign Stats
// Version: 1.0.0
//=============================================================================
/*:
 * @plugindesc v1.0.0 Allow players to assign stat points.
 *
 * @author Krues8dr
 *
 * @help
 * ============================================================================
 * Information
 * ============================================================================
 *
 * Adds the ability for players to buy stat points instead of automatically
 * increasing stats on level up.
 *
 * @param Stat Points
 * @desc Number of points for stats to award per level
 * @default 4
 *
 * @param Initial Points
 * @desc Number of points for stats characters start with
 * @default 0
 *
 * @param Cost Per Stat
 * @desc Number of points it costs to raise a stat one point
 * @default 1
 *
 * @param Default Level Increase
 * @desc yes/no  Use the default level-up increment for stats or only use point allocations?
 * @default yes
 *
 * Terms & Conditions
 * This plugin is free for non-commercial and commercial use.
 */

/*
 * TODO:
 *  (Optional) indicator of unspent points per actor.
 *  Make param list configurable.
 *  Set a minimum level to allow the user to start customizing, so that new
 *   players aren't overwhelmed.
 *  Make initial points toggleable if Level == 1 or not.
 */

var Imported = Imported || {};
Imported.Kru_AssignStats = "1.0.0";

var Kru = Kru || {};
Kru.AS = {
  config: {}
};

Kru.AS.Parameters = PluginManager.parameters('Kru_AssignStats');
Kru.AS.Parameters['Stat Points'] = Number(Kru.AS.Parameters['Stat Points']);
Kru.AS.Parameters['Initial Points'] = Number(Kru.AS.Parameters['Initial Points']);
Kru.AS.Parameters['Cost Per Stat'] = Number(Kru.AS.Parameters['Cost Per Stat']);
Kru.AS.Parameters['Default Level Increase'] = (
  String(Kru.AS.Parameters['Default Level Increase']).toLowerCase() === 'yes'
);


if(!Imported.Kru_Core) {
  alert("Kru_AssignStats requires Kru_Core.");
  throw new Error("Kru_AssignStats requires Kru_Core.");
}

/*
 * Setup our actors
 */

Kru.AS.DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
DataManager.isDatabaseLoaded = function() {
  Kru.AS.DataManager_isDatabaseLoaded.call(this);
  return true;
};

// Setup
Kru.AS.Game_Actor_Setup = Game_Actor.prototype.setup;
Game_Actor.prototype.setup = function (actorId) {
  Kru.AS.Game_Actor_Setup.call(this, actorId);
  if(typeof(this._statPoints) == 'undefined') {
    this._statPoints = Kru.AS.Parameters['Initial Points'];
  }
  if(typeof(this._statPointCostAmount) == 'undefined') {
    this._statPointCostAmount = [];
  }
};

// Level up
Kru.AS.Game_Actor_levelUp = Game_Actor.prototype.levelUp;
Game_Actor.prototype.levelUp = function () {
  Kru.AS.Game_Actor_levelUp.call(this);
  this._statPoints += Kru.AS.Parameters['Stat Points'];
};


Game_Actor.prototype.statPointCost = function(paramId) {
  if(typeof(this._statPointCostAmount[paramId]) != 'undefined') {
    return this._statPointCostAmount[paramId];
  }
  else {
    return Kru.AS.Parameters['Cost Per Stat'];
  }
};

if(!Kru.AS.Parameters['Default Level Increase']) {
  // Disable the level increase and reset back to base.
  Kru.AS.Game_Actor_paramBase = Game_Actor.prototype.paramBase;
  Game_Actor.prototype.paramBase = function(paramId) {
    return this.currentClass().params[paramId][1];
  };
}

function Scene_Status() {
    this.initialize.apply(this, arguments);
}

Scene_Status.prototype = Object.create(Scene_MenuBase.prototype);

/* Skill Tree Window */
function Kru_StatusWindow() {
  this.initialize.apply(this, arguments);
};

Kru_StatusWindow.prototype = Object.create(Kru_CustomListWindow.prototype);

Kru_StatusWindow.prototype.initialize = function(win) {
  Kru_CustomListWindow.prototype.initialize.call(this, win);



  var lineHeight = this.lineHeight();

  var params = this.getParams();

  for (var i = 0; i < params.length; i++) {

    var item = params[i];
    item.description = item.description || '';
    item.location = item.location || this.getItemLocation(item, i);
    item.width = item.width || 200;
    item.height = item.height || (lineHeight + this.margin);

    this._data.push(item);
  }

  this.refresh();

  this.select(0);
};

Kru_StatusWindow.prototype.getItemLocation = function(item, i) {
  var lineHeight = this.lineHeight();
  // TODO: Fix placement.
  var y = 50;
  var x = 10;
  var y2 = y + lineHeight * i + this.margin * 2;

  return [x, y2];
}

Kru_StatusWindow.prototype.getParams = function() {
  var params = [];

  // Only show params 0-5.
  for (var i = 0; i < 6; i++) {
    var paramId = i + 2;

    params.push({
      name: TextManager.param(paramId),
      value: function (id) { return this.actor.param(id)}.bind(this, paramId),
      id: paramId
    });
  }

  return params;
};

Kru_StatusWindow.prototype.drawItem = function(index) {
  var content = this._data[index];

  this.drawText(content.name, content.location[0], content.location[1], content.width - this.margin, 'left');
  this.drawText(content.value(), content.location[0], content.location[1], content.width - this.margin, 'right');
};

Kru_StatusWindow.prototype.drawHeader = function () {
  // Arbitrarily set this in the top left corner.
  this.contents.drawText(this.actor._name, 0, 10, 250, 10, 'left');
  this.changeTextColor(this.systemColor());
  this.contents.drawText($dataClasses[this.actor._classId].name, 350, 10, 250, 10, 'right');
  this.resetTextColor();
};

Kru_StatusWindow.prototype.drawFooter = function() {
  var content = String(this.actor._statPoints) + ' Pts';
  // Arbitrarily set this in the bottom right corner.
  this.contents.drawText(content, 670, 415, 100, 10, 'right');
};

Kru_StatusWindow.prototype.onOk = function() {
  var stat = this._data[this.index()];
  var statCost = this.actor.statPointCost(stat.id);

  // Failure states.
  if(this.actor._statPoints < statCost) {
    return this.failState();
  }

  this.addStatPoint(stat.id, 1);
  this.actor._statPoints -= statCost;
  this.refresh();
  this.activate();
};

Kru_StatusWindow.prototype.addStatPoint = function(id, amount) {
  this.actor.addParam(id, amount);
};

// Add new window type to the Window Manager
Kru.helpers.windowHandlers['statuswindow'] = Kru_StatusWindow;



Kru.AS.Scene_Status = Scene_Status;

function Scene_Status() {
    this.initialize.apply(this, arguments);
};

Scene_Status.prototype = Object.create(Scene_ItemBase.prototype);
Scene_Status.prototype.constructor = Scene_Skill;

Scene_Status.prototype.initialize = function() {
    Scene_ItemBase.prototype.initialize.call(this);
};

Scene_Status.prototype.create = function() {
  Scene_ItemBase.prototype.create.call(this);

  this.wm = new Kru.helpers.WindowManager(this);

  var actor = this.actor();

  // Top Window: stats
  var statusWin = this.wm.addWindow({
      width: 1,
      height: 0.75,
      type: 'statuswindow'
  });

  statusWin.window.activate();

  // Bottom Window: skill details.
  var infoWindow = this.wm.addWindow({
    width: 1,
    height: .25,
    type: 'help',
    content: '',
    setItem: function(item) {
      this.contents.clear();

      var content = '';
      if(item) {
        content = item.description;
      }
      this.setText(content);
    }
  });

  statusWin.window.setHelpWindow(infoWindow.window);
};
