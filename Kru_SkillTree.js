//=============================================================================
// Skill Tree
// Version: 1.0.0
//=============================================================================
/*:
 * @plugindesc v1.0.0 Skill Tree system
 *
 * @author Krues8dr
 *
 * @help
 * ============================================================================
 * Information
 * ============================================================================
 *
 * Adds the ability for players to buy skills from a skill tree.
 *
 * @param Skill Points
 * @desc Number of skill points to award per level
 * @default 1
 *
 * @param Initial Points
 * @desc Number of skill points characters start with
 * @default 0
 *
 * Terms & Conditions
 * This plugin is free for non-commercial and commercial use.
 */

/*
 * TODO:
 *  Properly add skills for use in battle.
 *  Add support for items that add bonuses to skills.
 */

var Imported = Imported || {};
Imported.Kru_SkillTree = "1.0.0";

var Kru = Kru || {};
Kru.ST = {
  config: {}
};

Kru.ST.Parameters = PluginManager.parameters('Kru_SkillTree');
Kru.ST.Parameters['Skill Points'] = Number(Kru.ST.Parameters['Skill Points']);
Kru.ST.Parameters['Initial Points'] = Number(Kru.ST.Parameters['Initial Points']);


if(!Imported.Kru_Core) {
  alert("Kru_SkillTree requires Kru_Core.");
  throw new Error("Kru_SkillTree requires Kru_Core.");
}

/*
 * Setup our actors
 */

Kru.ST.DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
DataManager.isDatabaseLoaded = function() {
  Kru.ST.DataManager_isDatabaseLoaded.call(this);
  Kru.ST.processNotes();
  return true;
};

Kru.ST.processNotes = function() {
  for(i = 0; i < $dataSkills.length; i++) {
    if($dataSkills[i]) {
      $dataSkills[i]._notes = Kru.helpers.parseNoteTags($dataSkills[i].note);
    }
  }
  for(i = 0; i < $dataClasses.length; i++) {
    if($dataClasses[i]) {
      $dataClasses[i]._notes = Kru.helpers.parseNoteTags($dataClasses[i].note);
    }
  }
};

// Setup
Kru.ST.Game_Actor_Setup = Game_Actor.prototype.setup;
Game_Actor.prototype.setup = function (actorId) {
  Kru.ST.Game_Actor_Setup.call(this, actorId);
  if(typeof(this._skillPoints) == 'undefined') {
    this._skillPoints = Number(Kru.ST.Parameters['Initial Points']);
  }
  // We store our saved skills under actor._stskills
  if(typeof(this._stskills) == 'undefined') {
    this._stskills = [];
  }
};

// Level up
Kru.ST.Game_Actor_levelUp = Game_Actor.prototype.levelUp;
Game_Actor.prototype.levelUp = function () {
  Kru.ST.Game_Actor_levelUp.call(this);
  this._skillPoints += Number(Kru.ST.Parameters['Skill Points']);
};


/* Add option to skill window */
Kru.ST.Window_SkillType_makeCommandList =
  Window_SkillType.prototype.makeCommandList;

Window_SkillType.prototype.makeCommandList = function() {
  this.addCustomCommandBefore();
  Kru.ST.Window_SkillType_makeCommandList.call(this);
};

if (!Window_SkillType.prototype.addCustomCommandBefore) {
  Window_SkillType.prototype.addCustomCommandBefore = function() {
  };
};

Kru.ST.Window_SkillType_addCustomCommandBefore =
  Window_SkillType.prototype.addCustomCommandBefore;

Window_SkillType.prototype.addCustomCommandBefore = function() {
  Kru.ST.Window_SkillType_addCustomCommandBefore.call(this);
  if (this.findExt('skillTree') === -1) {
    this.addSkillsCommand();
  }
};

Window_SkillType.prototype.addSkillsCommand = function() {
  this.addCommand('Set Skills', 'skill', true, 'skillTree');
};


/* Skill Tree Window */
function Kru_TreeWindow() {
  this.initialize.apply(this, arguments);
};

Kru_TreeWindow.prototype = Object.create(Kru_CustomListWindow.prototype);

Kru_TreeWindow.prototype.initialize = function(win) {
  Kru_CustomListWindow.prototype.initialize.call(this, win);

  var classData = $dataClasses[this.actor._classId];

  this.lines = classData._notes.lines;
  var skills = classData._notes.skills;
  for(i_i = 0; i_i < skills.length; i_i++) {
    skills[i_i] = Object.assign(skills[i_i], $dataSkills[skills[i_i].id]);
    skills[i_i]._name = skills[i_i].name;
    skills[i_i]._description = skills[i_i].description;
    skills[i_i] = this.updateSkill(skills[i_i]);
  }
  this._data = skills;

  if(this._data && this._data.length) {
    this._index = 0;
  }

  this.refresh();

  this.select(0);
};

Kru_TreeWindow.prototype.updateSkill = function(skill) {
  // Show the description as the name and description combined.
  skill.description = skill._name + ' - ' + skill._description;

  // Show any requirements in the description.
  if(skill._notes.req) {
    // Level requirement.
    if(skill._notes.req.level) {
      skill.description += ' Must be level ' +
        String(skill._notes.req.level) + '.';
    }

    // Previous skill requirement.
    if(skill._notes.req.skill) {
      var reqs = [];
      for(j = 0; j < skill._notes.req.skill.length; j++) {
        var req = $dataSkills[skill._notes.req.skill[j].id].name;
        if(skill._notes.req.skill[j].level) {
          req += ' level ' + String(skill._notes.req.skill[j].level);
        }
        reqs.push(req);
      }
      skill.description += ' Requires ' + reqs.join(' and ') + '.';
    }
  }

  // Show the current/max level as the name.
  var lvl = 0;
  if(this.actor._stskills[skill.id]) {
    lvl = Number(this.actor._stskills[skill.id].level);
  }
  var max = skill._notes.max || 1;

  skill.name = String(lvl) + '/' + String(max);

  if(!this.skillAvailable(this.actor, skill)) {
    skill.disabled = true;
  }
  else {
    skill.disabled = false;
  }

  return skill;
};

Kru_TreeWindow.prototype.updateAllSkills = function() {
  for(uAS_i = 0; uAS_i < this._data.length; uAS_i++) {
    this._data[uAS_i] = this.updateSkill(this._data[uAS_i]);
  }
}

Kru_TreeWindow.prototype.onOk = function() {
  var skill = this._data[this.index()];

  // Failure states.
  if(this.actor._skillPoints == 0) {
    return this.failState();
  }

  // Requirements.
  if(!this.skillAvailable(this.actor, skill)) {
    return this.failState();
  }

  // Past the max.
  if(skill._notes.max && this.actor._stskills[skill.id] &&
    this.actor._stskills[skill.id].level == skill._notes.max) {
      return this.failState();
  }

  // Increment the skill for the actor.
  if(!this.actor._stskills[skill.id]) {
    this.actor._stskills[skill.id] = {
      level: 0
    };
  }
  this.actor._stskills[skill.id].level++;
  this.actor._skillPoints--;

  this.updateAllSkills();
  this.refresh();
  this.activate();
};

Kru_TreeWindow.prototype.skillAvailable = function(actor, skill) {
  if(skill._notes.req) {
    if(skill._notes.req.level && actor._level < skill._notes.req.level) {
      return false
    }
    if(skill._notes.req.skill) {
      for(sA_i = 0; sA_i < skill._notes.req.skill.length; sA_i++) {
        var req = skill._notes.req.skill[sA_i];
        if(!actor._stskills[req.id]) {
          return false;
        }

        if(req.level && actor._stskills[req.id].level < req.level) {
          return false;
        }
      }
    }
  }

  return true;
};

Kru_TreeWindow.prototype.refresh = function() {
  if (this.contents) {
    this.contents.clear();
  }
  this.drawClassName();
  this.drawAllLines();
  this.drawAllItems();
  this.drawUnusedPoints();
};

Kru_TreeWindow.prototype.redrawItem = function(index) {
  // TODO: Make this more efficient. At the moment, we don't know where lines
  // have been drawn, so we can't just clear a rectangle.
  this.updateSkill(this._data[index]);
  this.refresh();
  this.select(index);
};

Kru_TreeWindow.prototype.drawClassName = function() {
  var content = $dataClasses[this.actor._classId].name;

  // Arbitrarily set this in the top left corner.
  this.contents.drawText(content, 0, 10, 250, 10, 'left');
};

Kru_TreeWindow.prototype.drawUnusedPoints = function() {
  var content = String(this.actor._skillPoints) + ' Pts';
  // Arbitrarily set this in the bottom right corner.
  this.contents.drawText(content, 670, 415, 100, 10, 'right');
};

// Add new window type to the Window Manager
Kru.helpers.windowHandlers['skilltree'] = Kru_TreeWindow;


/* Override select of Set Skills */
Kru.ST.Scene_Skill__commandSkill = Scene_Skill.prototype.commandSkill;

Scene_Skill.prototype.commandSkill = function() {
  if(this._skillTypeWindow._skillWindow._stypeId === 'skillTree') {
    SceneManager.push(Scene_SkillChoice);
  }
  else {
    Kru.ST.Scene_Skill__commandSkill.call(this);
  }
};

function Scene_SkillChoice() {
    this.initialize.apply(this, arguments);
};

Scene_SkillChoice.prototype = Object.create(Scene_ItemBase.prototype);
Scene_SkillChoice.prototype.constructor = Scene_Skill;

Scene_SkillChoice.prototype.initialize = function() {
    Scene_ItemBase.prototype.initialize.call(this);
};

Scene_SkillChoice.prototype.create = function() {
  Scene_ItemBase.prototype.create.call(this);

  this.wm = new Kru.helpers.WindowManager(this);

  // Top Window: skill tree.
  var treeWin = this.wm.addWindow({
      width: 1,
      height: 0.75,
      type: 'skilltree'
  });

  treeWin.window.activate();

  treeWin.window.setHandler('cancel', function() {
    this.popScene();
  }.bind(this));

  // Bottom Window: skill details.
  var infoWindow = this.wm.addWindow({
    width: 1,
    height: .25,
    type: 'help',
    content: '',
    setItem: function(item) {
      this.contents.clear();

      var content = '';
      if(item) {
        content = item.description;
      }
      this.setText(content);
    }
  });

  treeWin.window.setHelpWindow(infoWindow.window);
};
