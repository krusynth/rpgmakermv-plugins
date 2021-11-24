//=============================================================================
// Kru_ExtraMovementFramesPatch.js
//=============================================================================

/*:
 * @plugindesc Adds movement frames to battle enemies. A *much* simpler version
 * of Yanfly's AnimatedSVEnemies.
 * @author Krusynth
 *
 * @help
 * This plugin allows for very simple multiframe animations of enemies. Create
 * your sprite with frames horizontally.  In the enemy tags, add a line listing
 * the number of frames, like so: <frames:4>
 *
 * You can set the order of the frames using a sequence tag: <sequence:3,2,1,0>
 *
 * You can set the speed of the animation using a speed tag: <speed:10>  The
 * default speed is 12; smaller is faster, bigger is slower.
 */

var Imported = Imported || {};
Imported.Kru_BMF = "1.0.0";

var Kru = Kru || {};
Kru.BMF = {
};

if(!Imported.Kru_Core) {
  alert('Kru_PipeMinigame requires Kru_Core.');
  throw new Error('Kru_PipeMinigame requires Kru_Core.');
}

Kru.BMF.Sprite_Enemy___initialize = Sprite_Enemy.prototype.initialize;
Sprite_Enemy.prototype.initialize = function(battler) {
  Kru.BMF.Sprite_Enemy___initialize.call(this, battler);

  this._motionCount = 0;
  this._pattern = 0;

  let meta = $dataEnemies[this._enemy._enemyId].meta;

  if(meta && meta.frames) {
    this._motion = Sprite_Actor.MOTIONS.walk;
    this._motion.frames = meta.frames;
    if(meta.sequence) {
      this._motion.sequence = meta.sequence.split(',').map(n => parseInt(n));
    }
    if(meta.speed) {
      this._motion.speed = meta.speed;
    }
  }
}

Sprite_Enemy.prototype.update = function() {
  Sprite_Battler.prototype.update.call(this);
  if (this._enemy) {
    this.updateMotion();
    this.updateEffect();
    this.updateStateSprite();
  }
};

Sprite_Enemy.prototype.updateMotion = function() {
  this.updateMotionCount();
  this.updateBitmap();
  this.updateFrame();
}

Sprite_Enemy.prototype.updateFrame = function() {
  Sprite_Battler.prototype.updateFrame.call(this);
  const bitmap = this.bitmap;
  if (bitmap) {
    const frames = this._motion.frames || 3;
    const motionIndex = this._motion ? this._motion.index : 0;

    const pattern = this._pattern < frames ? this._pattern : 1;
    let currentIndex = pattern;
    if(this._motion.sequence) {
      currentIndex = this._motion.sequence[pattern];
    }

    const cw = bitmap.width / this._motion.frames;
    const ch = bitmap.height;
    const cx = Math.floor(motionIndex / 6) * 3 + currentIndex;
    const cy = motionIndex % 6;

    this.setFrame(cx * cw, cy * ch, cw, ch);
  }
};

Sprite_Enemy.prototype.updateMotionCount = function() {
  if (this._motion && ++this._motionCount >= this.motionSpeed()) {
    if (this._motion.loop) {
      const frames = this._motion.frames || 4;
      this._pattern = (this._pattern + 1) % 4;
    } else if (this._pattern < 2) {
      this._pattern++;
    } else {
      this.refreshMotion();
    }
    this._motionCount = 0;
  }
};

Sprite_Enemy.prototype.motionSpeed = function() {
  return this._motion.speed || 12;
};