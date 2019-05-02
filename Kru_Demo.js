//=============================================================================
// Krues8dr Demo
// Version: 1.0.0
//=============================================================================
/*:
 * @plugindesc 1.0.0 Helper for demos of plugins.
 *
 * @author Krues8dr
 *
 * @param Path
 * @desc Path for images and audio files.
 * @default ./
 *
 * @param Container
 * @desc Id of the HTML element to load the game into. Defaults to the document body.
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
Imported.Kru_Demo = "1.0.0";

var Kru = Kru || {};
Kru.Demo = {
  config: {}
};

Kru.Demo.params = PluginManager.parameters('Kru_Demo');

Kru.Demo.elm = document.body;
if(Kru.Demo.params.Container) {
  Kru.Demo.elm = document.getElementById(Kru.Demo.params.Container);
}

/* Fix all of the asset load paths. */
Kru.Demo.fixUrl = function(url) {
  return url.replace(/^/, Kru.Demo.params['Path']);
}

Kru.Demo.Bitmap_load = Bitmap.load;
Bitmap.load = function(url) {
  return Kru.Demo.Bitmap_load.call(this, Kru.Demo.fixUrl(url));
};

Kru.Demo.Bitmap_request = Bitmap.request;
Bitmap.request = function(url) {
  return Kru.Demo.Bitmap_request.call(this, Kru.Demo.fixUrl(url));
}

Kru.Demo.Graphics_setLoadingImage = Graphics.setLoadingImage;
Graphics.setLoadingImage = function(src) {
  return Kru.Demo.Graphics_setLoadingImage.call(this, Kru.Demo.fixUrl(src));
};

AudioManager._path = Kru.Demo.fixUrl(AudioManager._path);

/* Load the game into a custom html container. */
/* Override every instance of document.body. */
Graphics._createErrorPrinter = function() {
  this._errorPrinter = document.createElement('p');
  this._errorPrinter.id = 'ErrorPrinter';
  this._updateErrorPrinter();
  Kru.Demo.elm.appendChild(this._errorPrinter);
};

Graphics._createCanvas = function() {
  this._canvas = document.createElement('canvas');
  this._canvas.id = 'GameCanvas';
  this._updateCanvas();
  Kru.Demo.elm.appendChild(this._canvas);
};

Graphics._createVideo = function() {
  this._video = document.createElement('video');
  this._video.id = 'GameVideo';
  this._video.style.opacity = 0;
  this._video.setAttribute('playsinline', '');
  this._video.volume = this._videoVolume;
  this._updateVideo();
  makeVideoPlayableInline(this._video);
  Kru.Demo.elm.appendChild(this._video);
};

Graphics._createUpperCanvas = function() {
  this._upperCanvas = document.createElement('canvas');
  this._upperCanvas.id = 'UpperCanvas';
  this._updateUpperCanvas();
  Kru.Demo.elm.appendChild(this._upperCanvas);
};

Graphics._createModeBox = function() {
  var box = document.createElement('div');
  box.id = 'modeTextBack';
  box.style.position = 'absolute';
  box.style.left = '5px';
  box.style.top = '5px';
  box.style.width = '119px';
  box.style.height = '58px';
  box.style.background = 'rgba(0,0,0,0.2)';
  box.style.zIndex = 9;
  box.style.opacity = 0;

  var text = document.createElement('div');
  text.id = 'modeText';
  text.style.position = 'absolute';
  text.style.left = '0px';
  text.style.top = '41px';
  text.style.width = '119px';
  text.style.fontSize = '12px';
  text.style.fontFamily = 'monospace';
  text.style.color = 'white';
  text.style.textAlign = 'center';
  text.style.textShadow = '1px 1px 0 rgba(0,0,0,0.5)';
  text.innerHTML = this.isWebGL() ? 'WebGL mode' : 'Canvas mode';

  Kru.Demo.elm.appendChild(box);
  box.appendChild(text);

  this._modeBox = box;
};

Graphics._createFontLoader = function(name) {
    var div = document.createElement('div');
    var text = document.createTextNode('.');
    div.style.fontFamily = name;
    div.style.fontSize = '0px';
    div.style.color = 'transparent';
    div.style.position = 'absolute';
    div.style.margin = 'auto';
    div.style.top = '0px';
    div.style.left = '0px';
    div.style.width = '1px';
    div.style.height = '1px';
    div.appendChild(text);
    Kru.Demo.elm.appendChild(div);
};