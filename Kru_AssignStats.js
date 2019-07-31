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
 *  Allow function for points per level.
 */

var Imported = Imported || {};
Imported.Kru_AssignStats = "1.0.0";

var Kru = Kru || {};
Kru.AS = {
  config: {},
  Params: [
    {
      name: function() { return TextManager.param(this.id); },
      value: function(actor) { return actor.param(this.id); },
      description: 'ATtacK power',
      param: 'atk',
      id: 2
    },
    {
      name: function() { return TextManager.param(this.id); },
      value: function(actor) { return actor.param(this.id); },
      description: 'DEFense power',
      param: 'def',
      id: 3
    },
    {
      name: function() { return TextManager.param(this.id); },
      value: function(actor) { return actor.param(this.id); },
      description: 'Magic ATtack power',
      param: 'mat',
      id: 4
    },
    {
      name: function() { return TextManager.param(this.id); },
      value: function(actor) { return actor.param(this.id); },
      description: 'Magic DeFense power',
      param: 'mdf',
      id: 5
    },
    {
      name: function() { return TextManager.param(this.id); },
      value: function(actor) { return actor.param(this.id); },
      description: 'AGIlity',
      param: 'agi',
      id: 6
    },
    {
      name: function() { return TextManager.param(this.id); },
      value: function(actor) { return actor.param(this.id); },
      description: 'LUcK',
      param: 'luk',
      id: 7
    }
  ]
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

  let lineHeight = this.lineHeight();

  let params = this.getParams();

  for (let i = 0; i < params.length; i++) {
    let item = params[i];
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
  let lineHeight = this.lineHeight();
  // TODO: Fix placement.
  let y = 50;
  let x = 10;
  let y2 = y + lineHeight * i + this.margin * 2;

  return [x, y2];
}

Kru_StatusWindow.prototype.getParams = function() {
  let params = Kru.AS.Params;

  return params;
};

Kru_StatusWindow.prototype.drawItem = function(index) {
  let content = this._data[index];
  let name = typeof content.name === 'function' ? content.name() : content.name;
  this.drawText(name, content.location[0], content.location[1], content.width - this.margin, 'left');
  this.drawText(content.value(this.actor), content.location[0], content.location[1], content.width - this.margin, 'right');
};

Kru_StatusWindow.prototype.drawHeader = function () {
  // Arbitrarily set this in the top left corner.
  this.contents.drawText(this.actor._name, 0, 10, 250, 10, 'left');
  this.changeTextColor(this.systemColor());
  this.contents.drawText($dataClasses[this.actor._classId].name, 350, 10, 250, 10, 'right');
  this.resetTextColor();
};

Kru_StatusWindow.prototype.drawFooter = function() {
  let content = String(this.actor._statPoints) + ' Pts';
  // Arbitrarily set this in the bottom right corner.
  this.contents.drawText(content, 670, 415, 100, 10, 'right');
};

Kru_StatusWindow.prototype.onOk = function() {
  let stat = this._data[this.index()];
  let statCost = this.actor.statPointCost(stat.id);

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

  // Top Window: stats
  let statusWin = this.wm.addWindow({
      width: 1,
      height: 0.75,
      type: 'statuswindow'
  });

  statusWin.window.activate();

  // Bottom Window: skill details.
  let infoWindow = this.wm.addWindow({
    width: 1,
    height: .25,
    type: 'help',
    content: '',
    setItem: function(item) {
      this.contents.clear();

      let content = '';
      if(item) {
        content = item.description;
      }
      this.setText(content);
    }
  });

  statusWin.window.setHelpWindow(infoWindow.window);
};
