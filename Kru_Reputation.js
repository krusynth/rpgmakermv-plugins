//=============================================================================
// Reputation
// Version: 1.0.0
//=============================================================================
/*:
 * @plugindesc v1.0.0 Reputation system
 *
 * @author Krues8dr
 *
 * @help
 * ============================================================================
 * Information
 * ============================================================================
 *
 * Keeps track of your reputation with various factions & friends.
 *
 * Note: for convenience of management, you'll need to create a Variable for
 * each faction that you're keeping track of. These must be named like so:
 * KruRep:Your Group Name
 *
 * To increase or decrease your character's reputation, just increase the value
 * of the variable.
 *
 * You can give discounts at shops by running this script before 'Shop Processing':
 * KruFactionDiscountPrice('Faction Name', 'Known', '-10%'); // To use a percentage
 * KruFactionDiscountPrice('Faction Name', 'Known', -20); // For a flat amount
 *
 * You can also increase your character's sell price from the default (505) at
 * these shops with:
 * KruFactionSellBonus('Famous', '20%'); // To use a percentage
 * KruFactionSellBonus('Famous', 30); // For a flat amount
 *
 * @param Menu Name
 * @desc The name of the menu item to look at your faction status.
 * @default Factions
 *
 * @param Reputation Levels
 * @desc Names for different reputation levels.
 * @default Despised:-100, Hated:-50, Unknown:0, Familiar:50, Known:100
 *
 * @param Show Unknown Factions
 * @desc Show factions that haven't been discovered yet on the menu?
 * @type boolean
 * @on Yes
 * @off No
 * @default true
 *
 * @param Icons
 * @desc Name of the icon file to use, in img/system, without the file extension.
 * @type file
 * @dir img/system
 *
 * @param Icon Size
 * @parent Icons
 * @type number
 * @desc Size of the icons to use.
 * @default 16
 *
 * @param Custom Icons
 * @parent Icons
 * @desc By default, the icons will be determined by their order in the variables. This option allows you to override the default.
 * @type struct<CustomIcon>[]
 *
 * Terms & Conditions
 * This plugin is free for non-commercial and commercial use.
 */

/*~struct~CustomIcon:
 * @param Faction
 * @type variable
 *
 * @param Icon
 * @desc The index of the icon in the icon file. 0 is the first icon, etc.
 * @type number
 */

/*
 * TODO:
 *  Set factions in Map notes.
 */

var Imported = Imported || {};
Imported.Kru_Reputation = "1.0.0";

var Kru = Kru || {};

if(!Imported.Kru_Core) {
  alert("Kru_Reputation requires Kru_Core.");
  throw new Error("Kru_Reputation requires Kru_Core.");
}

Kru.RP = {
  config: {},
  factions: [],
  factionMap: {},
  prefix: 'KruRep:'
};

Kru.RP.Parameters = PluginManager.parameters('Kru_Reputation');
Kru.RP.Parameters['Show Unknown Factions'] = (
  Kru.RP.Parameters['Show Unknown Factions'].toLowerCase() === 'true'
);
Kru.RP.Parameters['Icon Size'] = parseInt(Kru.RP.Parameters['Icon Size']);
// Preload our images.
if(Kru.RP.Parameters['Icons']) {
  ImageManager.loadSystem(Kru.RP.Parameters['Icons']);
}

// Transmogrifying a list of integers into something usable in Javascript is
// hard. We build a wrapper class to handle all the sorting and type mangling.
function ReputationLevels(levels) {
  this.values = [];
  this.levels = {};
  this.levelsLookup = {};

  this.init = function(levels) {
    let tmpLevels = levels.split(',').reduce(function(obj, value) {
      [name, value] = value.trim().split(':');
      if(name.length && value.length) {
        obj[value.trim()] = name.trim();
      }
      return obj;
    }, {});

    this.values = Object.keys(tmpLevels)
    .sort(function(a, b) {
      if(parseInt(a) < parseInt(b)) {
        return -1;
      }
      else if(parseInt(a) > parseInt(b)) {
        return 1;
      }
      return 0;
    })
    .map(function(val) { return parseInt(val); });

    for(let i = 0; i < this.values.length; i++) {
      let value = this.values[i];
      let name = tmpLevels[this.values[i]];
      this.levels[value] = name;
      this.levelsLookup[name] = value;
    }
  }

  this.getLevel = function(value) {
    let level = this.levels[ this.values[0] ];
    for(i = 0; i < this.values.length; i++) {
      if(value >= this.values[i]) {
        level = this.levels[ this.values[i] ];
      }
    }
    return level;
  }

  this.getValue = function(value) {
    return this.levelsLookup[value];
  }

  this.init(levels);
}

Kru.RP.levels =
  new ReputationLevels(Kru.RP.Parameters['Reputation Levels']);

if(!Imported.Kru_Core) {
  alert("Kru_SkillTree requires Kru_Core.");
  throw new Error("Kru_SkillTree requires Kru_Core.");
}

/*
 * Setup our factions.
 */

Kru.RP.DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
DataManager.isDatabaseLoaded = function() {
  Kru.RP.DataManager_isDatabaseLoaded.call(this);

  if(Kru.RP.factions.length) {
    return true;
  }

  // Store our factions.
  for(let i = 0; i < $dataSystem.variables.length; i++) {
    if($dataSystem.variables[i].substr(0, Kru.RP.prefix.length) == Kru.RP.prefix) {
      [trash, name] = $dataSystem.variables[i].split(':');
      Kru.RP.factions.push(name.trim());
      Kru.RP.factionMap[name.trim()] = i;
    }
  }

  return true;
};

Kru.RP.factionValue = function(name) {
  return $gameVariables._data[Kru.RP.factionMap[name]];
}

/*
 * Add our menu item.
 */

Kru.RP.Window_MenuCommand__addMainCommands = Window_MenuCommand.prototype.addMainCommands;

Window_MenuCommand.prototype.addMainCommands = function() {
  Kru.RP.Window_MenuCommand__addMainCommands.call(this);

  this.addCommand(Kru.RP.Parameters['Menu Name'], 'factions', true);
};

Kru.RP.Scene_Menu__createCommandWindow = Scene_Menu.prototype.createCommandWindow;

Scene_Menu.prototype.createCommandWindow = function() {
  Kru.RP.Scene_Menu__createCommandWindow.call(this);
  this._commandWindow.setHandler('factions', this.commandFactions.bind(this));
}

Scene_Menu.prototype.commandFactions = function() {
  SceneManager.push(Scene_Factions);
}

function Scene_Factions() {
    this.initialize.apply(this, arguments);
}

Scene_Factions.prototype = Object.create(Scene_MenuBase.prototype);
Scene_Factions.prototype.constructor = Scene_Factions;

Scene_Factions.prototype.create = function(){
  Scene_MenuBase.prototype.create.call(this);

  this.wm = new Kru.helpers.WindowManager(this);

  this.wm.addWindow({
    width: 1,
    height: 0.11,
    content: Kru.RP.Parameters['Menu Name']
  })

  let factions = [];
  for(let i = 0; i < Kru.RP.factions.length; i++) {
    let value = Kru.RP.factionValue(Kru.RP.factions[i]);

    if(
      Kru.RP.Parameters['Show Unknown Factions'] ||
      typeof value !== 'undefined'
    ) {
      value = value || 0;
      factions.push({
        name: Kru.RP.factions[i],
        value: value,
        rank: Kru.RP.levels.getLevel(value),
        index: i
      });
    }
  }

  let winOptions = {
    width: 1,
    height: 0.89,
    type: 'faction',
    content: factions,
    icon: {
      set: Kru.RP.Parameters['Icons'],
      width: Kru.RP.Parameters['Icon Size'],
      height: Kru.RP.Parameters['Icon Size']
    }
  };

  if(Kru.RP.Parameters['Icons']) {
    winOptions['lineHeight'] = Kru.RP.Parameters['Icon Size']+4;
  }

  let factionWin = this.wm.addWindow(winOptions);

  factionWin.window.activate();
}

function Kru_FactionWindow() {
  this.initialize.apply(this, arguments);
};

Kru_FactionWindow.prototype = Object.create(Kru_GenericListWindow.prototype);

Kru_FactionWindow.prototype.initialize = function(win) {
  Kru_GenericListWindow.prototype.initialize.call(this, win);

  // Set event handlers.
  this.setHandler('cancel', this.onCancel.bind(this));
}

Kru_FactionWindow.prototype.onCancel = function() {
  this._win.scene.popScene();
};

Kru_FactionWindow.prototype.drawItem = function(index) {
  var content = this._data[index];
  var yOffset = this.lineHeight() * index;

  if(Kru.RP.Parameters['Icons']) {
    let item = {
      name: content.name,
      iconIndex: index
    };
    this.drawItemName(item, 0, yOffset, this._win._w);
  }
  else {
    this.drawText(content.name, 0, yOffset, this._win._w);
  }

  let color = 3;
  if(content.value < 0) {
    color = 2;
  }

  // Width is window width minus 2 * standardPadding
  let width = this._win._w - (2 * this.standardPadding());
  let rankText = content.rank+' ('+content.value+')';

  this.changeTextColor(this.textColor(color));
  this.drawText(rankText, 0, yOffset, width, 'right');
  this.resetTextColor();
};
Kru.helpers.windowHandlers['faction'] = Kru_FactionWindow;

/*
 * Allow faction discounts or make more expensive
 */
KruSetFaction = function(factionName) {
  if($gameMap._interpreter._eventId) {
    $gameMap._events[$gameMap._interpreter._eventId]._faction = factionName;
  }
  else {
    $gameMap._faction = factionName;
  }
}

Kru.RP.__processFactionDiscountArgs = function(args) {
  let faction, level, discount;
  if(args.length == 3) {
    [faction, level, discount] = args;
  }
  else if(args.length == 2) {
    [level, discount] = args;
    faction = $gameMap._events[$gameMap._interpreter._eventId]._faction ||
      $gameMap._faction;

  }

  if(!Number.isInteger(level)){
    if(/^[0-9]+$/.test(level)) {
      level = parseInt(level);
    }
    else {
      level = Kru.RP.levels.getValue(level);
    }
  }

  return [faction, level, discount];
}

Kru.RP.__adjustPrice = function(price, adjustment) {
  if(adjustment) {
    if(/^-?[0-9.]+%$/.test(adjustment)) {
      let tmpDiscount = 1 + (Number(adjustment.substr(0, adjustment.length -1)) / 100)
      price = price * tmpDiscount;
    }
    else {
      price = price + Number(adjustment);
    }
  }
  return price;
}

// Usage:
// KruFactionDiscountPrice('Faction Name', 'Known', '-10%');
// KruFactionDiscountPrice('Famous', -20);
KruFactionDiscountPrice = function() {
  [faction, level, discount] = Kru.RP.__processFactionDiscountArgs(arguments);

  if(faction && Kru.RP.factionValue(faction) >= level) {
    $gameMap._events[$gameMap._interpreter._eventId]._discount = discount;
  }
}

Kru.RP.Window_ShopBuy__price = Window_ShopBuy.prototype.price;
Window_ShopBuy.prototype.price = function(item) {
  let price = Kru.RP.Window_ShopBuy__price.call(this, item);
  let discount = $gameMap._events[$gameMap._interpreter._eventId]._discount;
  return Kru.RP.__adjustPrice(price, discount);
};

Kru.RP.Scene_Shop__create = Scene_Shop.prototype.create;
Scene_Shop.prototype.create = function() {
  Kru.RP.Scene_Shop__create.call(this);
  if($gameMap._events[$gameMap._interpreter._eventId]._discount) {
    this._helpWindow.setText('We\'ve got special prices for friends.');
  }
}

// Usage:
// KruFactionSellBonus('Faction Name', 'Known', '10%');
// KruFactionSellBonus('Famous', 20);
KruFactionSellBonus = function() {
  [faction, level, bonus] = Kru.RP.__processFactionDiscountArgs(arguments);
  if(faction && Kru.RP.factionValue(faction) > level) {
    $gameMap._events[$gameMap._interpreter._eventId]._sellBonus = bonus;
  }
}

Kru.RP.Scene_Shop__sellingPrice = Scene_Shop.prototype.sellingPrice;
Scene_Shop.prototype.sellingPrice = function() {
  let price = Kru.RP.Scene_Shop__sellingPrice.call(this);
  let bonus = $gameMap._events[$gameMap._interpreter._eventId]._sellBonus;
  return Kru.RP.__adjustPrice(price, bonus);
};