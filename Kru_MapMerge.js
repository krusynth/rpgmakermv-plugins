//=============================================================================
// Map Merge
// Version: 1.0.0
//=============================================================================
/*:
 * @plugindesc v1.0.0 Merges maps if conditions are met.
 *
 * @author Krues8dr
 *
 * @help
 * ============================================================================
 * Information
 * ============================================================================
 *
 * This plugin allows authors to replace a section of a map with a new map
 * when a given set of conditions are met.
 *
 * Usage
 * Add a line to the parent map's notes field with a JSON object in the
 * following format. The id is the id number of the child map to use. You can
 * find this number at the bottom of the map window in RPG Maker MV.
 *
 * {"mapmerge":[{"condition":"$gameActors._data[1]._level > 10","mapId":40,"offset":{"x":4,"y":4}}]}
 *
 * In this example, map 40 will be inserted into the current map at [4,4], if
 * the first actor is above level 10.
 *
 * Terms & Conditions
 * This plugin is free for non-commercial and commercial use.
 */

var Imported = Imported || {};
Imported.Kru_MapMerge = "1.0.0";

var Kru = Kru || {};
Kru.MapMerge = {
  config: {}
};

if(!Imported.Kru_Core) {
  alert('Kru_StatOverhaul requires Kru_Core.');
  throw new Error('Kru_StatOverhaul requires Kru_Core.');
}

Kru.MapMerge.DataManager_loadMapData = DataManager.loadMapData;
DataManager.loadMapData = function(mapId) {
  if (mapId > 0) {
    $dataMap = Kru.helpers.getMapData(mapId, Kru.MapMerge.processMap);

    Kru.MapMerge.processMap($dataMap);
  } else {
    this.makeEmptyMap();
  }
}

Kru.MapMerge.processMap = function(parentMap) {
  let notes = Kru.helpers.parseNoteTags(parentMap.note);

  if(typeof(notes.mapmerge) !== 'undefined') {
    for(gms_i = 0; gms_i < notes.mapmerge.length; gms_i++) {
      let map = notes.mapmerge[gms_i];
      if(
        map.mapId &&
        (typeof(map.condition) === 'undefined' ||
        eval(map.condition))
      ) {
        let mapData = Kru.helpers.getMapData(map.mapId);

        let offset = {x:0, y:0};
        if(map.offset) {
          offset = map.offset;
        }

        Kru.MapMerge.mapMergeTiles(parentMap, mapData, offset);
        Kru.MapMerge.mapMergeEvents(parentMap, mapData, offset);
      }
    }
  }
};

Kru.MapMerge.mapMergeTiles = function(map1, map2, offset) {
  offset = offset || {};
  offset.x = offset.x || 0;
  offset.y = offset.y || 0;

  // Depth (Z) is generally the same for all maps.
  let depth = map1.data.length / (map1.width * map1.height);

  let height = map2.height;
  if(height > map1.height) {
    height = map1.height;
  }

  let width = map2.width;
  if(width > map1.width) {
    width = map1.width;
  }

  // Depth
  for(let z = 0; z < depth; z++) {
    // Rows
    for(let y = 0; y < height; y++) {
      // Columns
      for(let x = 0; x < width; x++) {
        let idx1 = ((z * map1.height) + (y + offset.y)) * map1.width + offset.x + x;
        let idx2 = (z * map2.height + y) * map2.width + x

        // Remap our tile.
        map1.data[idx1] = map2.data[idx2];
      }
    }
  }
}

Kru.MapMerge.mapMergeEvents = function(map1, map2, offset) {
  offset = offset || {};
  offset.x = offset.x || 0;
  offset.y = offset.y || 0;

  for(let i = 0; i < map2.events.length; i++) {
    let event = map2.events[i];
    if(event) {
      // Increment our id.
      event.id = map1.events.length;

      event.x += offset.x;
      event.y += offset.y;

      if(typeof(event.meta) === 'undefined') {
        event.meta = {};
      }

      map1.events.push(event);
    }
  }
}

// Remove extra map load when the map hasn't changed on scene load.
// This fixes the issue where exiting the menu resets the map.
Kru.MapMerge.Scene_Map_create = Scene_Map.prototype.create;
Scene_Map.prototype.create = function() {
    Scene_Base.prototype.create.call(this);
    this._transfer = $gamePlayer.isTransferring();
    // Here's what we're changing.
    if(this._transfer) {
      DataManager.loadMapData($gamePlayer.newMapId());
    }
};
