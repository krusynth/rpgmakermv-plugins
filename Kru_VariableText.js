//=============================================================================
// Variable Text
// Version: 1.0.2
//=============================================================================
/*:
 * @plugindesc v1.0.2 Replace text using a datafile.
 *
 * @author Krues8dr
 *
 * @help
 * ============================================================================
 * Information
 * ============================================================================
 *
 * Loads a JSON file containing a dictionary of text to replace in messages. Use
 * \vt[my variable] or $my variable$ placeholders to replace with your specified
 * text. By default, the datafile will be /data/VariableText.json but this can
 * be customized below.
 *
 * Works with Yanfly Message Core.
 *
 * Example datafile:
 *
 * {"mayor": "Mayor Gigglesworth", "cat": "Catish Kittington"}
 *
 * @param Datafile
 * @desc The name of the data file to load. ".json" will be added to this automatically.
 * @default VariableText
 * @type file
 *
 * Terms & Conditions
 * This plugin is free for non-commercial and commercial use.
 */

var Imported = Imported || {};
Imported.Kru_VariableText = "1.0.0";

var Kru = Kru || {};
Kru.VT = {};
Kru.VT.Parameters = PluginManager.parameters('Kru_VariableText');

Kru.VT.init = function() {
  DataManager.loadDataFile('kruVariableText', Kru.VT.Parameters.Datafile+'.json');
}
Kru.VT.init();

Kru.VT.Window_Base_convertExtraEscapeCharacters =
  Window_Base.prototype.convertExtraEscapeCharacters;

Window_Base.prototype.convertExtraEscapeCharacters = function(text) {
  text = Kru.VT.convertVariableText(text);
  text = Kru.VT.Window_Base_convertExtraEscapeCharacters.call(this, text);
  return text;
};

Kru.VT.replaceVariableText = function(match, name) {
  if(typeof kruVariableText[name] !== 'undefined') {
    return kruVariableText[name];
  }
  else return '';
};

Kru.VT.convertVariableText = function(text) {
  text = text.replace(/\x1bvt\[([^\]]+)\]/gi, Kru.VT.replaceVariableText);
  text = text.replace(/\$([^\$]+)\$/gi, Kru.VT.replaceVariableText);
  return text;
};

