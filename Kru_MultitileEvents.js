/*:
 * Multitle Events
 *
 * @plugindesc 1.0 Allows for events that are bigger than 1 tile.
 *
 * @author Krues8dr (krues8dr.com)
 *
 * @help
 * This plugin allows for events that are bigger than one tiles, by
 * expanding the collision box via notes. This works nicely for
 * larger sprites and allows for movement per normal. This tag uses
 * JSON in the notes field, instead of tags.
 *
 * By default all events are 1 tile high and 1 tile wide. To make a
 * larger event add a note of the format {"size": {"w": #, "h": #}}
 * where the h and w are the number of tiles to *add* to the height
 * and width respectively. For example, {"size":{"w":[-1,1],"h":2}}
 * will result in a 2-tile tall, 1 tile wide event.
 *
 * You can also specify an offset from the main event tile by using
 * a pair of values e.g.: {"size": {"w": [-1,1], "h": [-1,1]}}
 * will result in a 3x3 entity centered on the event's location.
 *
 * These are evaluated when the event is loaded for the map, not
 * when the data is loaded.
 *
 * Terms & Conditions
 * This plugin is MIT Licensed. (Free for non-commercial and commercial use.)
 */

var Imported = Imported || {};
Imported.Kru_MultitileEvents = 1.0;

var Kru = Kru || {};
Kru.MT = {
  config: {}
};

if(!Imported.Kru_Core) {
  alert('Kru_MultitileEvents requires Kru_Core.');
  throw new Error('Kru_MultitileEvents requires Kru_Core.');
}

Game_CharacterBase.prototype._w = 0;
Game_CharacterBase.prototype._h = 0;

Kru.MT.Game_Event__initialize = Game_Event.prototype.initialize;
Game_Event.prototype.initialize = function(mapId, eventId) {
    Game_Character.prototype.initialize.call(this);
    this._mapId = mapId;
    this._eventId = eventId;
    let event = this.event();
    // event.meta = Kru.helpers.parseNoteTags(event.note);

    this.Kru_handleSizing(event);
    this.locate(event.x, event.y);
    this.refresh();
};

Game_Event.prototype.Kru_handleSizing = function(event) {
  if(
    typeof(event.meta) !== 'undefined' &&
    typeof(event.meta.size) !== 'undefined'
  ) {
    let size = event.meta.size;

    if(typeof size.w !== 'undefined') {
      // If we have only one number, start at zero.
      if(!Array.isArray(size.w)) {
        this._w = [0, size.w];
      }
      else {
        this._w = size.w;
      }
    }
    else {
      this._w = [0, 0];
    }

    if(typeof size.h !== 'undefined') {
      // If we have only one number, start at zero.
      if(!Array.isArray(size.h)) {
        this._h = [0, size.h];
      }
      else {
        this._h = size.h;
      }
    }
    else {
      this._h = [0, 0];
    }
  }
}

Game_CharacterBase.prototype.pos = function(x, y) {
  if(this._w && this._h) {
    return (x >= this._x + this._w[0] && x <= this._x + this._w[1] &&
      y >= this._y + this._h[0] && y <= this._y + this._h[1]);
  }
  else {
    return (x === this._x && y === this._y);
  }
};

// Fix collision checking to ignore itself.
Game_Event.prototype.isCollidedWithEvents = function(x, y) {
    let events = $gameMap.eventsXyNt(x, y).filter(function(event) {
      return (event._eventId !== this._eventId);
    }.bind(this));
    return events.length > 0;
};

// We need to check if we can move to the location, multitile.
Game_Event.prototype.canPassOrig = Game_Event.prototype.canPass;
Game_Event.prototype.canPass = function(init_x, init_y, d) {
  for(var x = init_x + this._w[0]; x <= init_x + this._w[1]; x++) {
    for(var y = init_y + this._h[0]; y <= init_y + this._h[1]; y++) {
      if(!this.canPassOrig(x, y, d)) {
        // console.log('cant pass', init_x, init_y, this._w, this._h, x, y, d);
        return false;
      }
    }
  }
  return true;
}
