//=============================================================================
// Skill Toggle
// Version: 1.0.0
//=============================================================================
/*:
 * @plugindesc Creates passive skills that can be toggled on/off.
 *
 * @author Krusynth
 *
 * @help
 * ============================================================================
 * Information
 * ============================================================================
 *
 * Creates passive skills that can be toggled on/off.
 *
 * Terms & Conditions
 * This plugin is free for non-commercial and commercial use.
 */

/*
 * TODO
 *   - Refresh reserve after adding points to skills.
 */
var Imported = Imported || {};
Imported.Kru_SkillToggle = "1.0.0";

var Kru = Kru || {};
Kru.STog = {};

if(!Imported.Kru_Core) {
  alert("Kru_SkillToggle requires Kru_Core.");
  throw new Error("Kru_SkillToggle requires Kru_Core.");
}

if(!Imported.Kru_SkillCore) {
  alert("Kru_SkillToggle requires Kru_SkillCore.");
  throw new Error("Kru_SkillToggle requires Kru_SkillCore.");
}

Kru.STog.Window_SkillList_drawItem = Window_SkillList.prototype.drawItem;
Window_SkillList.prototype.drawItem = function(index) {
    var skill = this._data[index];
    if (skill) {
        var costWidth = this.costWidth();
        var rect = this.itemRect(index);
        rect.width -= this.textPadding();
        this.changePaintOpacity(this.isEnabled(skill));
        this.drawItemName(skill, rect.x, rect.y, rect.width - costWidth);
        this.drawSkillCost(skill, rect.x, rect.y, rect.width);
        this.changePaintOpacity(1);
    }
};

Kru.STog.Window_SkillList___drawItemName = Window_SkillList.prototype.drawItemName;
Window_SkillList.prototype.drawItemName = function(item, x, y, width) {
    width = width || 312;
    if (item) {
        var iconBoxWidth = Window_Base._iconWidth + 4;

        this.resetTextColor();
        if(item.meta && item.meta.type) {
          if(item.meta.type == 'toggle') {
            if(this._actor._stskills[item.id].toggleState == true) {
              this.changeTextColor(this.textColor(23));
            }
            else {
              this.changeTextColor(this.textColor(22));
            }
          }
        }
        this.drawIcon(item.iconIndex, x + 2, y + 2);
        this.drawText(item.name, x + iconBoxWidth, y, width - iconBoxWidth);
    }
};

Kru.STog.setHelpWindowItem = Window_SkillList.prototype.setHelpWindowItem;
Window_SkillList.prototype.setHelpWindowItem = function(item) {
    this._helpWindow.contents.clear();
    this._helpWindow.setText('');
    Kru.STog.setHelpWindowItem.call(this, item);

    // If this skill is toggleable we need to show the state in the help.
    let msg;
    if (this._helpWindow && item) {
      if(item.meta && item.meta.type) {
        if(item.meta.type == 'toggle') {
          if(this._actor._stskills[item.id].toggleState == true) {
            msg = '[ACTIVE]';
            this._helpWindow.changeTextColor(this.textColor(23));

          }
          else {
            msg = '[INACTIVE]';
            this._helpWindow.changeTextColor(this.textColor(22));
          }
        }
      }

      if(msg) {
        this._helpWindow.drawText(msg, 0, 32, Graphics.boxWidth - this.padding*2, 'right')
      }
      this.resetTextColor();
    }
};

Kru.STog.Window_SkillList___isCurrentItemEnabled = Window_SkillList.prototype.isCurrentItemEnabled;
Window_SkillList.prototype.isCurrentItemEnabled = function() {
  let result = Kru.STog.Window_SkillList___isCurrentItemEnabled.call(this);
  let item = this.item();
  if(!result && item && item.meta && item.meta.type) {
    if(item.meta.type == 'toggle') {
      result = true;
    }
  }
  return result;
}

// Create method to calculate reserved points.
Kru.STog.Game_Battler___refresh = Game_Battler.prototype.refresh;

Kru.STog.Game_BattlerBase___initialize = Game_BattlerBase.prototype.initialize;
Game_BattlerBase.prototype.initialize = function() {
  Kru.STog.Game_BattlerBase___initialize.call(this);
  this.resetReserve();
  this._stskills = this._stskills || [];
  this._mtp = this._mtp || 100;
  this._tp = this._tp || 0;
}

Game_BattlerBase.prototype.maxTp = function() {
  return this._mtp;
}

Game_Battler.prototype.resetReserve = function() {
  this._hpReserved = 0;
  this._mpReserved = 0;
  this._tpReserved = 0;
}

Game_Battler.prototype.updateReserve = function() {
  this.resetReserve();
  for(let i = 0; i < this._stskills.length; i++) {
    if(this._stskills[i] && $dataSkills[i] && $dataSkills[i].meta &&
    $dataSkills[i].meta.type == 'toggle') {

      let skillInfo = $dataSkills[i];
      let hp = this.skillHpCost($dataSkills[i]);
      let mp = this.skillMpCost($dataSkills[i]);
      let tp = this.skillTpCost($dataSkills[i]);

      if(this._stskills[i].toggleState) {
        // We alread paid once, so we don't have to pay again.
        // this._hp -= hp;
        // this._mp -= mp;
        // this._tp -= tp;
        this._hpReserved += hp;
        this._mpReserved += mp;
        this._tpReserved += tp;
      }
      else {
        // We already paid for the skills in the default action, so we double
        // the payback here.
        this._hp += hp * 2;
        this._mp += mp * 2;
        this._tp += tp * 2;
      }

    }
  }
}

// Game_Battler.prototype.refresh = function() {
//   Kru.STog.Game_Battler___refresh.call(this);
//   this.updateReserve();
// }

// Confirm action is handled by the Scene.
Kru.STog.Scene_Skill___useItem = Scene_Skill.prototype.useItem;
Scene_Skill.prototype.useItem = function() {
  Kru.STog.Scene_Skill___useItem.call(this);

  let item = this.item();
  this._actor._stskills[item.id].toggleState = !this._actor._stskills[item.id].toggleState;

  for(let i = 0; i < item.effects.length; i++) {
    // Toggle state effects.
    if(item.effects[i].code === Game_Action.EFFECT_ADD_STATE) {
      if(this._actor._stskills[item.id].toggleState) {
        this._actor.addState(item.effects[i].dataId);
      }
      else {
        this._actor.removeState(item.effects[i].dataId);
      }
    }
  }
  this._actor.clearResult();
  this._actor.updateReserve();
  this._statusWindow.refresh();

}

// First, we need a *little* more room to draw.
Window_Base.prototype._sWindow = {
  leftCol: {width: 120}
}

Kru.STog.Window_Base___drawActorSimpleStatus = Window_Base.prototype.drawActorSimpleStatus;
Window_Base.prototype.drawActorSimpleStatus = function(actor, x, y, width) {
  let width1 = this._sWindow.leftCol.width;
  let lineHeight = this.lineHeight();
  let x2 = x + width1;
  let width2 = width - width1 - this.textPadding();
  this.drawActorName(actor, x, y);
  this.drawActorLevel(actor, x, y + lineHeight * 1);
  this.drawActorIcons(actor, x, y + lineHeight * 2);
  this.drawActorClass(actor, x2, y, width2);
  this.drawActorHp(actor, x2, y + lineHeight * 1, width2);
  this.drawActorMp(actor, x2, y + lineHeight * 2, width2);
};

// Move the class all the way to the right.
Kru.STog.Window_Base___drawActorClass = Window_Base.prototype.drawActorClass;
Window_Base.prototype.drawActorClass = function(actor, x, y, width) {
    width = width || 168;
    this.resetTextColor();
    this.drawText(actor.currentClass().name, x, y, width, 'right');
};

// Squeeze our level over to the left.
Kru.STog.Window_Base___drawActorLevel = Window_Base.prototype.drawActorLevel;
Window_Base.prototype.drawActorLevel = function(actor, x, y) {
  let width1 = this._sWindow.leftCol.width;
  this.changeTextColor(this.systemColor());
  this.drawText(TextManager.levelA, x, y, 48);
  this.resetTextColor();
  this.drawText(actor.level, x + Math.ceil(width1 / 2), y, 36, 'right');
};

// Show our reserved values.
Kru.STog.Window_Base___drawActorHp = Window_Base.prototype.drawActorHp;
Window_Base.prototype.drawActorHp = function(actor, x, y, width) {
  width = width || 186;
  let color1 = this.hpGaugeColor1();
  let color2 = this.hpGaugeColor2();
  let gaugeW = width;
  let textW = width;
  let gaugeR = 0;
  let textR = 70;
  let mhp = actor.mhp;

  if(actor._hpReserved) {
    textW = textW - textR;

    let percent = actor._hpReserved / actor.mhp;
    gaugeR = Math.floor(percent * gaugeW);
    gaugeW = gaugeW - gaugeR;
    this.drawGauge(x+gaugeW+5, y, gaugeR-5, actor.hpRate(), this.textColor(22), this.textColor(23));
    mhp -= actor._hpReserved;
  }
  this.drawGauge(x, y, gaugeW, actor.hpRate(), color1, color2);
  this.changeTextColor(this.systemColor());
  this.drawText(TextManager.hpA, x, y, 44);
  this.drawCurrentAndMax(actor.hp, mhp, x, y, textW,
    this.hpColor(actor), this.normalColor());
  this.changeTextColor(this.textColor(23));
  if(actor._hpReserved) {
    this.drawText('('+actor._hpReserved+')', x+textW+5, y, textR, 'right');
  }
  this.resetTextColor();
};

Kru.STog.Window_Base___drawActorMp = Window_Base.prototype.drawActorMp;
Window_Base.prototype.drawActorMp = function(actor, x, y, width) {
  width = width || 186;
  var color1 = this.mpGaugeColor1();
  var color2 = this.mpGaugeColor2();
  let gaugeW = width;
  let textW = width;
  let gaugeR = 0;
  let textR = 70;
  let mmp = actor.mmp;

  if(actor.mmp && actor._mpReserved) {
    textW = textW - textR;

    let percent = actor._mpReserved / actor.mmp;
    gaugeR = Math.floor(percent * gaugeW);
    gaugeW = gaugeW - gaugeR;
    this.drawGauge(x+gaugeW+5, y, gaugeR-5, actor.hpRate(), this.textColor(22), this.textColor(23));

    mmp -= actor._mpReserved;
  }
  this.drawGauge(x, y, gaugeW, actor.mpRate(), color1, color2);
  this.changeTextColor(this.systemColor());
  this.drawText(TextManager.mpA, x, y, 44);
  this.drawCurrentAndMax(actor.mp, mmp, x, y, textW,
    this.mpColor(actor), this.normalColor());
  this.changeTextColor(this.textColor(23));
  if(actor._mpReserved) {
    this.drawText('('+actor._mpReserved+')', x+textW+5, y, textR, 'right');
  }
  this.resetTextColor();
};

Kru.STog.Game_BattlerBase___hpRate = Game_BattlerBase.prototype.hpRate;
Game_BattlerBase.prototype.hpRate = function() {
  let reserve = this._hpReserved || 0;
  return (this.hp - reserve) / (this.mhp - reserve);
};

Kru.STog.Game_BattlerBase___mpRate = Game_BattlerBase.prototype.mpRate;
Game_BattlerBase.prototype.mpRate = function() {
  let reserve = this._mpReserved || 0;
  return this.mmp > 0 ? (this.mp - reserve) / (this.mmp - reserve) : 0;
};

/* TODO
Game_BattlerBase.prototype.paySkillCost = function(skill) {
    this._mp -= this.skillMpCost(skill);
    this._tp -= this.skillTpCost(skill);
};
*/
