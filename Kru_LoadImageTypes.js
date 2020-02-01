//=============================================================================
// Kru_LoadImageTypes.js
//=============================================================================

/*:
 * @plugindesc Enables loading image files other than pngs in most use cases.
 * @author Krues8dr
 *
 * @help If you include a file extension, that file will be used. If not, ".png"
 * is added per usual.
 */

ImageManager.loadBitmap = function(folder, filename, hue, smooth) {
  if (filename) {
    if (!filename.match(/\.[a-z]{2,4}$/) ) {
      filename += '.png';
    }

    let path = folder + encodeURIComponent(filename);
    let bitmap = this.loadNormalBitmap(path, hue || 0);
    bitmap.smooth = smooth;
    return bitmap;
  } else {
    return this.loadEmptyBitmap();
  }
};