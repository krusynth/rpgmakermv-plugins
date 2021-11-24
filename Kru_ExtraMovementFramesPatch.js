//=============================================================================
// Kru_ExtraMovementFramesPatch.js
//=============================================================================

/*:
 * @plugindesc Patches Modern Algebra's Extra Movement Frames to fix web bugs.
 * @author Krusynth
 *
 * @param Pattern
 * @desc Pattern to match for the filename
 * @default \%[\(\[]([\d\s]*)[\)\]](@[0-9]+)?
 *
 * @help This plugin extends Modern Algebra's Extra Movement Frames to fix an
 * issue with the default filename pattern, which breaks on the web due to the
 * use of the % character.  Allows users to set their own regex patterns.
 *
 * The default cycle time can now also be set in the pattern, by using a second
 * matching group.
 */

var Kru = Kru || {};
Kru.EMFP = {
};

Kru.EMFP.params = PluginManager.parameters('Kru_ExtraMovementFramesPatch');
Kru.EMFP.params['Pattern'] = new RegExp(Kru.EMFP.params['Pattern']);

ImageManager.isEmfCharacter = function(filename) {
  return !!filename.match(Kru.EMFP.params['Pattern']);
};

Game_CharacterBase.prototype.maemfSetupEmfCharacter = function() {
  this.maClearEmfCharacterState();
  let charName = this.characterName();
  if (ImageManager.isEmfCharacter(charName)) {
    this._isEmfCharacter = true;
    let sign = charName.match(Kru.EMFP.params['Pattern']);
    let signArgs = [];
    if(sign[1].trim().length) {
      signArgs = sign[1].trim().split(' ').map(Number); // array of digit strings
    }

    this.cycleTime = typeof sign[2] == 'string' ? parseInt(sign[2].match(/[0-9]+/)) : ModernAlgebra.EMF.cycleTime;
    // Map arguments in file name to an array of numbers

    if(signArgs.length) {
      this.emfCharacterState().frameNum = signArgs.shift();
      this.emfCharacterState().idleFrame = (signArgs.length > 1) ? signArgs.shift() : ModernAlgebra.EMF.idleFrame;
    }

    if (signArgs.length > 2) {
      this.emfCharacterState().pattern = signArgs;
    } else {
      let success = false;
      // Check for a default match for this number of frames
      for (let i = 0; i < ModernAlgebra.EMF.defaultPattern.length; i++) {
        if (ModernAlgebra.EMF.defaultPattern[i][0] === this.emfCharacterState().frameNum) {
          this.emfCharacterState().idleFrame = ModernAlgebra.EMF.defaultPattern[i][1];
          this.emfCharacterState().pattern = ModernAlgebra.EMF.defaultPattern[i].slice(2, (ModernAlgebra.EMF.defaultPattern[i].length));
          success = true;
          break;
        }
      }
      // If still no pattern specified
      if (!success) {
        // Populate pattern with a simple cycle starting after idle
        this.emfCharacterState().pattern = [];
        let idleFramePlus = this.emfCharacterState().idleFrame + 1;
        for (let i = 0; i < this.emfCharacterState().frameNum; i++) {
          this.emfCharacterState().pattern.push((i + idleFramePlus) % this.emfCharacterState().frameNum);
        }
      }
    }
  }
};

Game_CharacterBase.prototype.animationWait = function() {
  // If EMF Character
  if (this.isEmfCharacter()) {
    let realSpeed = this.realMoveSpeed();
    let frameNum = this.maxPattern();
    return Math.floor((8 - realSpeed)*(this.cycleTime / (4*frameNum))); // CycleTime divided by number of frames in animation
  } else {
    // Run Default Method - approx. 60 frames at normal speed
    return ModernAlgebra.EMF.GameCharacterBase_animationWait.apply(this, arguments) // original method
  }
};