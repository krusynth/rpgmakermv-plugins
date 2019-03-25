//=============================================================================
// Krues8dr Core
// Version: 1.0.0
//=============================================================================
/*:
 * @plugindesc 1.0.0 Shared base for many Krues8dr plugins
 *
 * @author Krues8dr
 *
 * @param ---General---
 * @default
 *
 * @help
 * ============================================================================
 * Information
 * ============================================================================
 *
 * This is the base include for many Krues8dr RPG Maker MV plugins. It includes
 * a JSON loader and window manager.
 */

var Imported = Imported || {};
Imported.Kru_Core = "1.0.0";

var Kru = Kru || {};
Kru.Core = {
  config: {}
};

Kru.Parameters = PluginManager.parameters('Kru_Core');


/*** Helpers ***/
if(!Kru.helpers) {
  Kru.helpers = {};
}

Kru.helpers.getMapData = function(mapId, callback) {
  var filename = 'Map%1.json'.format(mapId.padZero(3));
  return this.getFileData(filename, callback);
};

// Gets data from a JSON file.
// Unlike the original version, this is synchronous and returns the result.
Kru.helpers.getFileData = function(src, callback) {
  var data;

  var xhr = new XMLHttpRequest();
  var url = 'data/' + src;
  xhr.open('GET', url, false);
  xhr.overrideMimeType('application/json');
  xhr.onload = function() {
    if (xhr.status < 400) {
      data = JSON.parse(xhr.responseText);
      DataManager.extractMetadata(data);

      if(typeof(callback) !== 'undefined') {
        callback(data);
      }
    }
  };
  xhr.onerror = function() {
    DataManager._errorUrl = DataManager._errorUrl || url;
  };
  xhr.send();

  return data;
};

// Parse tags into an object
Kru.helpers.parseNoteTags = function(note) {
  if(typeof(note) == 'string' && note.length > 0) {
    var data = {};

    // If we have JSON, use that.
    var notes = note.split(/\r?\n/);
    for(pNT = 0; pNT < notes.length; pNT++) {
      try {
        Object.assign(data, JSON.parse(notes[pNT]));
      } catch(e) {};
    }
    if(Object.keys(data).length > 0) {
      return data;
    }

    // Otherwise we have to parse some tags.
    var regex = /<([A-Za-z0-9-_]+) ?(.*?)>/g;
    var result = {};
    while(m = regex.exec(note)) {
      var name = m[1];

      // If we have multiple arguments, create a list.
      var value = m[2].split(' ');
      if(value.length > 1) {
        // If we have an assignment, we have a hash map.
        if(value[0].split('=').length > 1) {
          var values = {};
          for(j = 0; j < value.length; j++) {
            var valObj = value[j].split('=');
            values[valObj[0]] = Kru.helpers.normalizeValues(valObj[1]);
          }
        }
        // Otherwise we have a list of values
        else {
          values = [];
          for(j = 0; j < value.length; j++) {
            values.push(Kru.helpers.normalizeValues(value[j]));
          }
        }

        value = values;
      }
      else {
        value = Kru.helpers.normalizeValues(value[0]);
      }

      result[name] = value;
    }
    return result;
  }
  else return {};
};

Kru.helpers.normalizeValues = function(value) {
  if(value.match(/^[0-9]+$/)) {
    value = Number(value);
  }
  return value;
};

// Parse notes

Kru.helpers.processNotes = function(type) {
  if(type === 'skills') {
    // Only process once.
    if(typeof($dataSkills._kru_processed) === 'undefined') {
      for(i = 0; i < $dataSkills.length; i++) {
        if($dataSkills[i]) {
          $dataSkills[i]._notes = Kru.helpers.parseNoteTags($dataSkills[i].note);
        }
      }
      $dataSkills._kru_processed = true;
    }
  }
  else if(type === 'classes') {
    // Only process once.
    if(typeof($dataClasses._kru_processed) === 'undefined') {
      for(i = 0; i < $dataClasses.length; i++) {
        if($dataClasses[i]) {
          $dataClasses[i]._notes = Kru.helpers.parseNoteTags($dataClasses[i].note);
        }
      }
      $dataClasses._kru_processed = true;
    }
  }
};


/*
 * Kru WindowManager – the easy way to manage scene windows.
 */

Kru.helpers.WindowManager = function (scene) {
  this.scene = scene;

  this.last = {
    _x: 0,
    _y: 0,
    _w: 0,
    _h: 0
  };
  this.windows = [];

  this.addWindow = function(win) {
    win._w = Graphics.boxWidth * win.width;
    win._h = Graphics.boxHeight * win.height;

    // By default, put this next to the previous item.
    if(typeof(win._x) == 'undefined' && typeof(win._y) == 'undefined') {
      win._x = this.last._x + this.last._w;
      win._y = this.last._y;

      // If this won't fit next to the previous item, move it to the next row.
      if(win._x + win._w > Graphics.boxWidth) {
        win._x = 0;
        win._y = this.last._y + this.last._h;
      }
    }

    win.scene = this.scene;
    win.actor = this.scene.actor();

    if(Kru.helpers.windowHandlers[win.type]) {
      win.window = new Kru.helpers.windowHandlers[win.type](win);
    }
    else {
      win.window = new Kru.helpers.windowHandlers['default'](win);
    }

    win.window.open();
    win.window.show();

    this.windows.push(win);
    this.last = win;

    if(!win.window._handlers) {
      win.window._handlers = {};
    }

    this.scene.addWindow(win.window);

    return win;
  }

  return this;
}

Kru.helpers.windowHandlers = {
  default: Kru_GenericWindow,
  basic: Kru_GenericWindow,
  list: Kru_GenericListWindow,
  customlist: Kru_CustomListWindow,
  help: Kru_GenericHelpWindow
};

Kru.helpers.WindowManager.prototype.text = function() {};

/*
 * Window mixin
 */

var Kru_WindowMixin = function() {
  this._iconSet = 'IconSet';
  this._iconWidth = Window_Base._iconWidth;
  this._iconHeight = Window_Base._iconHeight;
  this._lineHeight = 36;

  this.iconInit = function(win) {
    if(win.icon) {
      if(win.icon.height) {
        this._iconHeight = win.icon.height;
      }
      if(win.icon.width) {
        this._iconWidth = win.icon.width;
      }
      if(win.icon.set) {
        this._iconSet = win.icon.set;
      }
    }
    if(typeof win.lineHeight !== 'undefined') {
      this._lineHeight = win.lineHeight;
    }
  };

  this.loadIcons = function(name) {
    this.bitmap = ImageManager.loadSystem(name);
  };

  this.drawIcon = function(iconIndex, x, y, set) {
    if(!this.bitmap) {
      if(!set) {
        set = this._iconSet;
      }
      this.loadIcons(set);
    }

    let cols = Math.round(this.bitmap.width / this._iconWidth);

    var pw = this._iconWidth;
    var ph = this._iconHeight;
    var sx = iconIndex % cols * pw;
    var sy = Math.floor(iconIndex / cols) * ph;
    this.contents.blt(this.bitmap, sx, sy, pw, ph, x, y);
  };

  this.drawItemName = function(item, x, y, width) {
    width = width || 312;
    if (item) {
        var iconBoxWidth = this._iconWidth + 4;
        this.resetTextColor();
        this.drawIcon(item.iconIndex, x + 2, y + 2);
        this.drawText(item.name, x + iconBoxWidth, y, width - iconBoxWidth);
    }
  };

  this.lineHeight = function() {
    return this._lineHeight;
  };

  return this;
}

/*
 * Override the Base window to take an object with all of the properties we need.
 */

function Kru_GenericWindow() {
  this.initialize.apply(this, arguments);
}

Kru_GenericWindow.prototype = Object.create(Window_Base.prototype);
Kru_GenericWindow.prototype.constructor = Window_Base;

Kru_GenericWindow.prototype.initialize = function(win) {
  this._win = win;

  Window_Base.prototype.initialize.call(this, win._x, win._y, win._w, win._h);
  if(win.content) {
    this.drawText(win.content, 0, 0, win._w);
  }

  this.iconInit(win);
}

Kru_WindowMixin.call(Kru_GenericWindow.prototype);

/*
 * Override the Selectable window to expect a list.
 */
function Kru_GenericListWindow() {
  this.initialize.apply(this, arguments);
}

Kru_GenericListWindow.prototype = Object.create(Window_Selectable.prototype);
Kru_GenericListWindow.prototype.constructor = Window_Selectable;

Kru_GenericListWindow.prototype.initialize = function(win) {
  this._win = win;
  this._data = win.content;

  if(this._data && this._data.length) {
    this._index = 0;
  }

  this.iconInit(win);

  Window_Selectable.prototype.initialize.call(this, win._x, win._y, win._w, win._h);
  this.refresh();
};

Kru_GenericListWindow.prototype.maxItems = function() {
    if(this._data && this._data.length) {
      return this._data.length;
    }
    else {
      return 0;
    }
};

Kru_GenericListWindow.prototype.drawItem = function(index) {
  var content = this._data[index];
  var yOffset = this.lineHeight() * index;

  if(typeof content === 'object') {
    this.drawItemName(content, 0, yOffset, this._win._w);
  }
  else {
    this.drawText(content, 0, yOffset, this._win._w);
  }
};

Kru_GenericListWindow.prototype.updateHelp = function() {
  this.setHelpWindowItem(this.item());
};

// Stolen from Window_ItemList.
Kru_GenericListWindow.prototype.item = function() {
    var index = this.index();
    return this._data && index >= 0 ? this._data[index] : null;
};

Kru_WindowMixin.call(Kru_GenericListWindow.prototype);

/*
 * Override the Help window to not put it at the top of the screen.
 */
function Kru_GenericHelpWindow() {
  this.initialize.apply(this, arguments);
}

Kru_GenericHelpWindow.prototype = Object.create(Window_Help.prototype);
Kru_GenericHelpWindow.prototype.constructor = Window_Help;

Kru_GenericHelpWindow.prototype.initialize = function(win) {
    this._win = win;

    this.iconInit(win);

    Window_Base.prototype.initialize.call(this, win._x, win._y, win._w, win._h);
    this._text = '';
};

Kru_GenericHelpWindow.prototype.drawTextExOrig = Window_Base.prototype.drawTextEx;
Kru_GenericHelpWindow.prototype.drawTextEx = function(text, x, y) {

  //One character width
  var charW = this.textWidth('X');
  var width = this._win._w - (2 * this.textPadding());
  var charsPerLine = Math.floor(width / charW);

  var newText = '';
  // TODO: break on spaces instead of just line width.
  // TODO: fix spaces at the beginning of a line.
  for(i = 0; i < text.length; i += (charsPerLine - 2)) {
    newText += text.substring(i, i+(charsPerLine - 2)) + "\n";
  }

  this.drawTextExOrig(newText, x, y);
}

Kru_WindowMixin.call(Kru_GenericHelpWindow.prototype);

/*
 * Create a list window where items can be placed arbitrarily.
 */

function Kru_CustomListWindow() {
  this.initialize.apply(this, arguments);
};

Kru_CustomListWindow.prototype = Object.create(Kru_GenericListWindow.prototype);

Kru_CustomListWindow.prototype.initialize = function(win) {
  this.lines = [];

  if(typeof(win.actor) != 'undefined') {
    this.actor = win.actor;
  }

  Kru_GenericListWindow.prototype.initialize.call(this, win);

  this._data = win.content || [];
  this.lines = win.lines || [];

  if(this._data && this._data.length) {
    this._index = 0;
  }

  // TODO: Are these values already stored somewhere?
  this.margin = 3; // Standard margin for selections. this.padding is too big?
  this.itemheight = 42;
  this.iconWidth = 42; // this._iconWidth is too short?
  this.fontWidth = 14;

  // Set event handlers.
  this.setHandler('ok', this.onOk.bind(this));
  this.setHandler('cancel', this.onCancel.bind(this));

  this.refresh();
};

Kru_CustomListWindow.prototype.onOk = function() {
  this.refresh();
  this.activate();
};

Kru_CustomListWindow.prototype.onCancel = function() {
  this._win.scene.popScene();
};

Kru_CustomListWindow.prototype.failState = function() {
  SoundManager.playBuzzer();
  this.activate();
};

Kru_CustomListWindow.prototype.refresh = function() {
  if (this.contents) {
    this.contents.clear();
  }
  this.drawHeader();
  this.drawAllLines();
  this.drawAllItems();
  this.drawFooter();
};

Kru_CustomListWindow.prototype.drawTitle = function() {};
Kru_CustomListWindow.prototype.drawFooter = function() {};

Kru_CustomListWindow.prototype.drawAllLines = function() {
  if(this.lines && this.lines.length > 0) {
    for (var i = 0; i < this.lines.length; i++) {
      this.drawLine(this.lines[i]);
    }
  }
};

Kru_CustomListWindow.prototype.drawLine = function(line) {
  var color = '#ffffff';
  if(typeof(line.color) != 'undefined') {
    color = line.color;
  }

  var width = 2;
  if(typeof(line.width) != 'undefined') {
    width = line.width;
  }

  this.contents.kDrawLine(
    Math.ceil(line.location[0]),
    Math.ceil(line.location[1]),
    Math.ceil(line.location[2]),
    Math.ceil(line.location[3]),
    color, width);
};

Kru_CustomListWindow.prototype.drawItem = function(index) {
  var content = this._data[index];

  if(typeof content === 'object') {
    this.drawItemName(content, content.location[0], content.location[1], this._win._w);
  }
  else {
    this.drawText(content, content.location[0], content.location[1], this._win._w);
  }
};

Kru_CustomListWindow.prototype.drawItemName = function(item, x, y, width) {
    width = width || 312;
    if (item) {
        var iconBoxWidth = Window_Base._iconWidth + 4;
        if(item.disabled) {
          this.changeTextColor(this.textColor(7));
        }
        else {
          this.changeTextColor(this.normalColor());
        }

        var x2 = x;
        if(typeof(item.iconIndex) != 'undefined') {
          this.drawIcon(item.iconIndex, x + 2, y + 2);
          x2 += iconBoxWidth;
          width -= iconBoxWidth;
        }
        this.drawText(item.name, x2, y, width);
        this.changeTextColor(this.normalColor());
    }
};

Kru_CustomListWindow.prototype.updateCursor = function() {
  if (this._cursorAll) {
    var allRowsHeight = this.maxRows() * this.itemHeight();
    this.setCursorRect(0, 0, this.contents.width, allRowsHeight);
    this.setTopRow(0);
  } else if (this.isCursorVisible()) {
    var rect = this.itemRect(this.index());
    if(rect) {
      this.setCursorRect(
        rect.x - rect.margin, rect.y - rect.margin, rect.width, rect.height);
    }
  } else {
    this.setCursorRect(0, 0, 0, 0);
  }
};

// Reimplement the navigation commands for the tree.
Kru_CustomListWindow.prototype.itemRect = function(index) {
    var rect = new Rectangle();
    if(typeof(this._data) === 'undefined' ||
      typeof(this._data[index]) === 'undefined') {
      return;
    }
    var content = this._data[index];

    rect.x = content.location[0];
    rect.y = content.location[1];

    rect.width = 0; // this.itemWidth();
    if(typeof(content.width) != 'undefined') {
      rect.width = content.width;
    }
    else {
      if(content.iconIndex) {
        rect.width += this.iconWidth;
      }
      rect.width += (content.name.length * this.fontWidth);
    }

    rect.height = this.itemheight;// this.itemHeight();
    if(typeof(content.height) != 'undefined') {
      rect.height = content.height;
    }

    rect.margin = this.margin;

    if(typeof(content.margin) != 'undefined') {
      rect.margin = content.margin
    }

    return rect;
};

/* TODO
itemWidth
itemHeight

Kru_CustomListWindow.prototype.cursorDown = function(wrap) {
    var index = this.index();
    var maxItems = this.maxItems();
    var maxCols = this.maxCols();
    if (index < maxItems - maxCols || (wrap && maxCols === 1)) {
        this.select((index + maxCols) % maxItems);
    }
};

Kru_CustomListWindow.prototype.cursorUp = function(wrap) {
    var index = this.index();
    var maxItems = this.maxItems();
    var maxCols = this.maxCols();
    if (index >= maxCols || (wrap && maxCols === 1)) {
        this.select((index - maxCols + maxItems) % maxItems);
    }
};

Kru_CustomListWindow.prototype.cursorRight = function(wrap) {
    var index = this.index();
    var maxItems = this.maxItems();
    var maxCols = this.maxCols();
    if (maxCols >= 2 && (index < maxItems - 1 || (wrap && this.isHorizontal()))) {
        this.select((index + 1) % maxItems);
    }
};

Kru_CustomListWindow.prototype.cursorLeft = function(wrap) {
    var index = this.index();
    var maxItems = this.maxItems();
    var maxCols = this.maxCols();
    if (maxCols >= 2 && (index > 0 || (wrap && this.isHorizontal()))) {
        this.select((index - 1 + maxItems) % maxItems);
    }
};
*/



/*
 * Add a drawLine function to our Bitmap object. Useful for our tree windows.
 */

Bitmap.prototype.kDrawLine = function(x1, y1, x2, y2, color, width) {
    if(!color) {
      color = '#ffffff';
    }
    if(!width) {
      width = 1;
    }
    var context = this._context;
    context.save();
    context.strokeStyle = color;
    context.lineWidth = width;
    context.beginPath();
    context.moveTo(x1,y1);
    context.lineTo(x2,y2);
    context.stroke();
    context.restore();
    this._setDirty();
};

Bitmap.prototype.kDrawPolygon = function(points, line, fill) {
  var context = this._context;
  context.save();

  if(typeof(line.width) != 'undefined') {
    context.lineWidth = line.width;
  }
  if(typeof(line.color) != 'undefined') {
    context.strokeStyle = line.color;
  }
  if(typeof(fill.color) != 'undefined') {
    context.fillStyle = fill.color;
  }
  if(typeof(fill.alpha) != 'undefined') {
    context.globalAlpha = fill.alpha;
  }
  context.beginPath();

  context.moveTo(points[0][0], points[0][1]);

  for(i = 1; i < points.length; i++) {
    context.lineTo(points[i][0], points[i][1]);
  }


  context.closePath();

  if(typeof(fill) != 'undefined') {
    context.fill();
  }

  context.globalAlpha = 1;
}


// Function to debug any sounds when we don't want to run sounds.
// Usage: open the console and run DebugSound();

// TODO: Add AudioManager, etc.

DebugSound = function() {
  this.playSystemSound = function() {
    console.log('SoundManager.splaySystemSound');
  };
  this.playCursor = function() {
    console.log('SoundManager.playCursor');
  };
  this.playOk = function() {
    console.log('SoundManager.playOk');
  };
  this.playCancel = function() {
    console.log('SoundManager.playCancel');
  };
  this.playBuzzer = function() {
    console.log('SoundManager.playBuzzer');
  };
  this.playEquip = function() {
    console.log('SoundManager.playEquip');
  };
  this.playSave = function() {
    console.log('SoundManager.playSave');
  };
  this.playLoad = function() {
    console.log('SoundManager.playLoad');
  };
  this.playBattleStart = function() {
    console.log('SoundManager.playBattleStart');
  };
  this.playEscape = function() {
    console.log('SoundManager.playEscape');
  };
  this.playEnemyAttack = function() {
    console.log('SoundManager.playEnemyAttack');
  };
  this.playEnemyDamage = function() {
    console.log('SoundManager.playEnemyDamage');
  };
  this.playEnemyCollapse = function() {
    console.log('SoundManager.playEnemyCollapse');
  };
  this.playBossCollapse1 = function() {
    console.log('SoundManager.playBossCollapse1');
  };
  this.playBossCollapse2 = function() {
    console.log('SoundManager.playBossCollapse2');
  };
  this.playActorDamage = function() {
    console.log('SoundManager.playActorDamage');
  };
  this.playActorCollapse = function() {
    console.log('SoundManager.playActorCollapse');
  };
  this.playRecovery = function() {
    console.log('SoundManager.playRecovery');
  };
  this.playMiss = function() {
    console.log('SoundManager.playMiss');
  };
  this.playEvasion = function() {
    console.log('SoundManager.playEvasion');
  };
  this.playMagicEvasion = function() {
    console.log('SoundManager.playMagicEvasion');
  };
  this.playReflection = function() {
    console.log('SoundManager.playReflection');
  };
  this.playShop = function() {
    console.log('SoundManager.playShop');
  };
  this.playUseItem = function() {
    console.log('SoundManager.playUseItem');
  };
  this.playUseSkill = function() {
    console.log('SoundManager.playUseSkill]');
  };

  SoundManager = this;
}
