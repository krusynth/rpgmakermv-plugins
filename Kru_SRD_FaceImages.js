//=============================================================================
// Kru_SRD_FaceImages.js
//=============================================================================

/*:
 * @plugindesc Overrides the bust images of the SRC menu plugin.
 * @author Krues8dr
 *
 * @help Defaults to img/faces/filename
 */

Window_MenuStatus.prototype.drawBust = function(actor, rect, xOff, yOff) {
    // var bitmap = ImageManager.loadSumRndmDdeMB(actor.actor().ams_bs_bust);
    // var sx = bitmap.width / 2 - this.itemWidth() / 2;
    // this.contents.blt(bitmap, sx, sy,   sw,               sh,             dx,           dy);
    // this.contents.blt(bitmap, sx, 0, this.itemWidth(), bitmap.height, rect.x + xOff, (rect.height - bitmap.height) + yOff);
    this.drawFace(actor.faceName(), actor.faceIndex(), rect.x + xOff, yOff-80, this.itemWidth(), rect.height);
    // console.log('drawBust', actor.faceName(), actor.faceIndex(), xOff, yOff, this.itemWidth(), rect.height);
};