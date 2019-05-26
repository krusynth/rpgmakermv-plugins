//=============================================================================
// Krues8dr Skill Core
// Version: 1.0.0
//=============================================================================
/*:
 * @plugindesc 1.0.0 Shared base for Krues8dr skill-related plugins
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
 * This is the base include for many Krues8dr RPG Maker MV skill plugins. It
 * extends the core engine for better skill cost calculations. Skills can now
 * have an HP cost as well.
 */

var Imported = Imported || {};
Imported.Kru_SkillCore = "1.0.0";

var Kru = Kru || {};
Kru.SC = {};

// Cost adjustment
Kru.SC.Game_BattlerBase___paySkillCost = Game_BattlerBase.prototype.paySkillCost;
Game_BattlerBase.prototype.paySkillCost = function(skill) {
  this._hp -= this.skillHpCost(skill);
  this._mp -= this.skillMpCost(skill);
  this._tp -= this.skillTpCost(skill);
  // TODO: allow any arbitrary cost in skill meta.
};

Game_BattlerBase.prototype.canPaySkillCost = function(skill) {
  return this._tp >= this.skillTpCost(skill) &&
    this._mp >= this.skillMpCost(skill) &&
    this._hp >= this.skillHpCost(skill);
};

Kru.SC.Game_BattlerBase___skillMpCost = Game_BattlerBase.prototype.skillMpCost;
Game_BattlerBase.prototype.skillMpCost = function(item) {
  let cost = Kru.SC.Game_BattlerBase___skillMpCost.call(this, item);
  if(item.meta.cost && item.meta.cost.mp) {
    let a = this;
    eval(item.meta.cost.mp);
  }
  return cost;
};

Kru.SC.Game_BattlerBase___skillTpCost = Game_BattlerBase.prototype.skillTpCost;
Game_BattlerBase.prototype.skillTpCost = function(item) {
  let cost = Kru.SC.Game_BattlerBase___skillTpCost.call(this, item);
  let a = this;
  if(item.meta.cost && item.meta.cost.tp) {
    eval(item.meta.cost.tp);
  }
  return cost;
};

// This doesn't exist in the core engine.
Game_BattlerBase.prototype.skillHpCost = function(item) {
  let cost = item.hpCost || 0;
  if(item.meta.cost && item.meta.cost.hp) {
    eval(item.meta.cost.hp);
  }
  return cost;
};
