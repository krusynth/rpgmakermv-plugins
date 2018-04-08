/*:
 * Airship Events
 *
 * @plugindesc 1.0 Allows airships to interact with events.
 *
 * @author Krues8dr (krues8dr.com)
 *
 * @help
 * By default, RPG Maker MV doesn't allow airships to interact with
 * events – this plugin removes that limitation.
 *
 * Note that you'll have to create special handling for dealing with
 * transfers (e.g. entering towns, etc.) for airships to use this as
 * expected.  The easiest way to achieve this is to add to your event
 * a Conditional Branch for Vehicle: Airship is driven and move the
 * transfer into the Else clause.
 *
 * Terms & Conditions
 * This plugin is MIT Licensed. (Free for non-commercial and commercial use.)
 */

var Imported = Imported || {};
Imported.Kru_AirshipEvents = 1.0;

var Kru = Kru || {};
Kru.AE = {};

Kru.AE.Game_Player__canStartLocalEvents = Game_Player.prototype.canStartLocalEvents;

Game_Player.prototype.canStartLocalEvents = function() {
    return true;
};

Game_Player.prototype.forceOffVehicle = function() {
  this.setDirection(2);
  this._followers.synchronize(this.x, this.y, this.direction());
  this.vehicle().getOff();
  this.setTransparent(false);
  this._vehicleGettingOff = true;
  this.setMoveSpeed(4);
  this.setThrough(false);
  this.makeEncounterCount();
  this.gatherFollowers();
};