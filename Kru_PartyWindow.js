//=============================================================================
// Party Window
// Version: 1.0.0
//=============================================================================
/*:
 * @plugindesc v1.0.0 Shows more characters in the status window based on
 * Max Battle Members setting in Yanfly's Party System.
 *
 * @author Krues8dr
 *
 * @param ---General---
 * @default
 *
 * @param Use battle sprites for status menu
 * @desc Saves space by only using the battle sprites in the status menu.
 * Default: true
 * @default true
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

Kru.PW.Window_MenuStatus__numVisibleRows = Window_MenuStatus.numVisibleRows;

Window_MenuStatus.prototype.numVisibleRows = function() {
  return Yanfly.Param.MaxBattleMembers;
};

/* Demo to re-use the battle sprites int the status menu. */

/*
Window_MenuStatus.prototype.drawItemImage = function(index) {
    var actor = $gameParty.members()[index];
    var rect = this.itemRect(index);
    this.changePaintOpacity(actor.isBattleMember());
    console.log('location', rect.x + 1, rect.y + 1);
    this.drawActorCharacter(actor, rect.x + 1, rect.y + 1 + 12);
    this.changePaintOpacity(true);
};


Window_Base.prototype.drawActorFace = function(actor, x, y, width, height) {
    this.drawCharacter(actor.characterName(), actor.characterIndex(), x, y, width, height);
};


Window_Base.prototype.drawActorCharacter = function(actor, x, y) {
    this.drawCharacter(actor.characterName(), actor.characterIndex(), x, y);
};

Window_Base.prototype.drawCharacter = function(characterName, characterIndex, x, y) {
    var bitmap = ImageManager.loadCharacter(characterName);
    var big = ImageManager.isBigCharacter(characterName);
    var pw = bitmap.width / (big ? 3 : 12);
    var ph = bitmap.height / (big ? 4 : 8);
    var n = characterIndex;
    var sx = (n % 4 * 3 + 1) * pw;
    var sy = (Math.floor(n / 4) * 4) * ph;

    console.log('dim', pw, ph, sx, sy, x - pw /2, y);
    this.contents.blt(bitmap, sx, sy, pw, ph, x, y);
};

Window_MenuStatus.prototype.drawItemStatus = function(index) {
    var actor = $gameParty.members()[index];

    var bitmap = ImageManager.loadCharacter(actor.characterName());
    var big = ImageManager.isBigCharacter(actor.characterName());
    var pw = bitmap.width / (big ? 3 : 12);
console.log(pw);

    var rect = this.itemRect(index);
    var x = rect.x + pw + 12;
    var y = rect.y + rect.height / 2 - this.lineHeight() * 1.5;
    var width = rect.width - x - this.textPadding();
    this.drawActorSimpleStatus(actor, x, y, width);
};
*/