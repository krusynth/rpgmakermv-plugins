//=============================================================================
// Party Window
// Version: 1.0.0
//=============================================================================
/*:
 * @plugindesc v1.0.0 Shows more characters in windows based on
 * Max Battle Members setting in Yanfly's Party System.
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
 * This plugin requires Yanfly's Party System. It uses the value of
 * Max Battle Members set in that plugin to determine how many party members to
 * show on the status screen. Note that past 5 members, the font will be too
 * big to fit all of the information on the screen.
 *
 * Terms & Conditions
 * This plugin is free for non-commercial and commercial use.
 */

var Imported = Imported || {};
Imported.Kru_PartyWindow = "1.0.0";

var Kru = Kru || {};
Kru.PW = {
  config: {}
};

Kru.PW.Parameters = PluginManager.parameters('Kru_PartyWindow');

Kru.PW.Window_MenuStatus__numVisibleRows = Window_MenuStatus.prototype.numVisibleRows;
Window_MenuStatus.prototype.numVisibleRows = function() {
  return Yanfly.Param.MaxBattleMembers;
};

/*
 *  This overrides YEP_BattleEngineCore.js
 */
Kru.PW.Window_BattleStatus__numVisibleRows = Window_BattleStatus.prototype.numVisibleRows
Window_BattleStatus.prototype.numVisibleRows = function() {
  return Yanfly.Param.MaxBattleMembers;
};
