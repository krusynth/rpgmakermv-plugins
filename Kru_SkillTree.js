//=============================================================================
// Skill Tree
// Version: 1.0.1
//=============================================================================
/*:
 * @plugindesc Skill Tree system
 *
 * @author Krusynth
 *
 * @help
 * ============================================================================
 * Information
 * ============================================================================
 *
 * Adds the ability for players to buy skills from a skill tree. Skills can have
 * levels which can impact their efficacy and cost.
 *
 * @param Skill Points
 * @desc Number of skill points to award per level
 * @default 1
 *
 * @param Initial Points
 * @desc Number of skill points characters start with
 * @default 0
 *
 * @param Set Text
 * @desc Text for the Set command in the Skill menu.
 * @default Set
 *
 * Terms & Conditions
 * This plugin is free for non-commercial and commercial use.
 */

/*
 * TODO:
 *  Add support for items that add bonuses to skills.
 *  Fix sounds on class change.
 *  Document skill parameters.
 *  Allow custom cost for skills (items, strength, etc).
 *  Add additional requirements to unlock skills (strength, etc).
 *  Change sound to buzzer if you can't buy more levels.
 *  If a class has a skill by default, set the level to some value.
 *  Restructure the entire skill window, to put the Help info on bottom.
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

if(!Imported.Kru_SkillCore) {
  alert("Kru_SkillTree requires Kru_SkillCore.");
  throw new Error("Kru_SkillTree requires Kru_SkillCore.");
}

// Helper methods

// Test if the given actor has a skill, return the level if so.
function actorSkill(actorId, skill) {
  // If our skill is a name not an id.
  if(!Number.isInteger(skill)) {
    for(let i = 0; i < $dataSkills.length; i++) {
      if($dataSkills[i] && $dataSkills[i].name &&
        $dataSkills[i].name.toLowerCase() == skill.toLowerCase()
      ) {
        skill = $dataSkills[i].id;
        break;
      }
    }
  }
  if($gameActors._data[actorId]._stskills[skill]) {
    return $gameActors._data[actorId]._stskills[skill].level;
  }

  return 0;
}

// Test if anyone in the party has a skill at a particular level (defaults to 1).
function partySkill(skill, level) {
  level = level || 1;
  let result = $gameParty._actors.filter(function(actorId) {
    let skillLevel = actorSkill(actorId, skill);
    return skillLevel && skillLevel >= level;
  });
  if(!result.length) {
    result = false;
  }
  return result;
}

// Setup
Kru.ST.Game_Actor_Setup = Game_Actor.prototype.setup;
Game_Actor.prototype.setup = function (actorId) {
  Kru.ST.Game_Actor_Setup.call(this, actorId);
  if(typeof this._skillPoints == 'undefined') {
    this._skillPoints = Number(Kru.ST.Parameters['Initial Points']);
  }
  // We store our saved skills under actor._stskills
  if(typeof this._stskills == 'undefined') {
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
  this.addCustomCommandAfter();
};

if (!Window_SkillType.prototype.addCustomCommandBefore) {
  Window_SkillType.prototype.addCustomCommandBefore = function() {
  };
};

if (!Window_SkillType.prototype.addCustomCommandAfter) {
  Window_SkillType.prototype.addCustomCommandAfter = function() {
  };
};

Kru.ST.Window_SkillType_addCustomCommandAfter =
  Window_SkillType.prototype.addCustomCommandAfter;

Window_SkillType.prototype.addCustomCommandAfter = function() {
  Kru.ST.Window_SkillType_addCustomCommandAfter.call(this);
  if (this.findExt('skillTree') === -1) {
    this.addSkillsCommand();
  }
};

Window_SkillType.prototype.windowWidth = function() {
    return 320;
};

Window_SkillType.prototype.maxCols = function() {
    return 2;
};

Window_SkillType.prototype.addSkillsCommand = function() {
  if(this._actor) {

    let cmdText = Kru.ST.Parameters['Set Text'];
    let cmdWidth = this.textWidth(cmdText)+ this.spacing();

    for(let i = 0; i < this._list.length; i = i+2) {
      this._list[i].width = this.windowWidth() - (cmdWidth + this.padding * 2 + this.spacing());

      this._list.splice(i + 1, 0, {
        enabled: true,
        ext: ['set', this._list[i].ext],
        name: cmdText,
        symbol: 'skill',
        width: cmdWidth
      });
    }
  }
};

Window_SkillType.prototype.itemRect = function(index) {
  let rect = new Rectangle();
  let maxCols = this.maxCols();
  let item = this._list[index];
  rect.width = this.itemWidth(index);
  rect.height = this.itemHeight(index);
  rect.x = 0 - this._scrollX;

  let offset = index % maxCols;
  if(offset) {
    for(let i = 1; i <= offset; i++) {
      let prev = this._list[index - i];
      if(prev) {
        rect.x += this.itemWidth(index - i) + this.spacing();
      }
    }
  }

  rect.y = Math.floor(index / maxCols) * rect.height - this._scrollY;
  return rect;
};

Kru.ST.Window_SkillType___itemWidth = Window_SkillType.prototype.itemWidth;
Window_SkillType.prototype.itemWidth = function(index) {
  let item = this._list[index];
  if(item) {
    if(item.width) {
      return item.width;
    }
    else {
      return Kru.ST.Window_SkillType___itemWidth.call(this);
    }
  }
}

/* Skill Tree Window */
function Kru_TreeWindow() {
  this.initialize.apply(this, arguments);
};

Kru_TreeWindow.prototype = Object.create(Kru_CustomListWindow.prototype);

Kru_TreeWindow.prototype.initialize = function(win) {
  Kru_CustomListWindow.prototype.initialize.call(this, win);

  let category = win.category;

  let classSkills = this.getClassSkills(this.actor._classId);
  let skills = classSkills[win.category];

  this.lines = [];
  this._data = [];

  if(typeof(skills) != 'undefined') {
    for(let i = 0; i < skills.length; i++) {
      let skill = skills[i];
      if(skill.id === 'LINE') {
        this.lines.push(skill);
      }
      else {
        skill = Object.assign(skill, $dataSkills[skill.id]);
        skill._name = skills[i].name;
        skill._description = skills[i].description;
        skill = this.updateSkill(skills[i]);
        this._data.push(skill);
      }
    }
  }

  if(this._data && this._data.length) {
    this._index = 0;
  }

  this.refresh();

  this.select(0);
};

Kru_TreeWindow.prototype.getClassSkills = function(classId) {
  let classData = $dataClasses[classId];
  let skills = {};

  if(classData.meta) {
    if(classData.meta.parents) {
      // Add the skills from our parents.
      for(let i = 0; i < classData.meta.parents.length; i++) {
        skills = this.mergeSkillTypes(
          skills,
          this.getClassSkills(parseInt(classData.meta.parents[i]))
        );
      }
    }

    if(classData.meta.skills) {
      skills = this.mergeSkillTypes(
        skills,
        classData.meta.skills
      );
    }
  }

  return skills;
}

Kru_TreeWindow.prototype.mergeSkillTypes = function(skills, otherSkills) {
  let types = Object.keys(otherSkills);
  for(let j = 0; j < types.length; j++) {
    let type = types[j];
    if(typeof skills[type] === 'undefined') {
      skills[type] = [];
    }
    skills[type] = skills[type].concat(otherSkills[type]);
  }
  return skills;
}

Kru_TreeWindow.prototype.updateSkill = function(skill) {
  // Show the description as the name and description combined.
  skill.description = skill._name + ' - ' + skill._description;

  // Show any requirements in the description.
  if(skill.meta.req) {
    // Level requirement.
    if(skill.meta.req.level) {
      skill.description += ' Must be level ' +
        String(skill.meta.req.level) + '.';
    }

    // Previous skill requirement.
    if(skill.meta.req.skill) {
      let reqs = [];
      for(let j = 0; j < skill.meta.req.skill.length; j++) {
        let req = $dataSkills[skill.meta.req.skill[j].id].name;
        if(skill.meta.req.skill[j].level) {
          req += ' level ' + String(skill.meta.req.skill[j].level);
        }
        reqs.push(req);
      }
      skill.description += ' Requires ' + reqs.join(' and ') + '.';
    }
  }

  // Show the current/max level as the name.
  let lvl = 0;
  if(this.actor._stskills[skill.id]) {
    lvl = Number(this.actor._stskills[skill.id].level);
  }
  let max = skill.meta.max || 1;

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
  for(let i = 0; i < this._data.length; i++) {
    this._data[i] = this.updateSkill(this._data[i]);
  }
}

Kru_TreeWindow.prototype.onOk = function() {
  let skill = this._data[this.index()];

  // Failure states.
  if(this.actor._skillPoints == 0) {
    return this.failState();
  }

  // Requirements.
  if(!this.skillAvailable(this.actor, skill)) {
    return this.failState();
  }

  // Past the max.
  if(skill.meta.max && this.actor._stskills[skill.id] &&
    this.actor._stskills[skill.id].level == skill.meta.max) {
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

  this.actor.learnSkill(skill.id);

  this.updateAllSkills();
  this.refresh();
  this.activate();
};

Kru_TreeWindow.prototype.skillAvailable = function(actor, skill) {
  if(skill.meta.req) {
    if(skill.meta.req.level && actor._level < skill.meta.req.level) {
      return false
    }
    if(skill.meta.req.skill) {
      for(sA_i = 0; sA_i < skill.meta.req.skill.length; sA_i++) {
        let req = skill.meta.req.skill[sA_i];
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

Kru_TreeWindow.prototype.redrawItem = function(index) {
  // TODO: Make this more efficient. At the moment, we don't know where lines
  // have been drawn, so we can't just clear a rectangle.
  this.updateSkill(this._data[index]);
  this.refresh();
  this.select(index);
};

Kru_TreeWindow.prototype.drawHeader = function() {
  // let content = $dataClasses[this.actor._classId].name;
  let content = $dataSystem.skillTypes[this._win.category];

  // Arbitrarily set this in the top left corner.
  this.contents.drawText(content, 0, 10, 250, 10, 'left');
};

Kru_TreeWindow.prototype.drawFooter = function() {
  let content = String(this.actor._skillPoints) + ' Pts';
  // Arbitrarily set this in the bottom right corner.
  this.contents.drawText(content, 670, 415, 100, 10, 'right');
};

// Add new window type to the Window Manager
Kru.helpers.windowHandlers['skilltree'] = Kru_TreeWindow;


/* Override select of Set Skills */
Kru.ST.Scene_Skill__commandSkill = Scene_Skill.prototype.commandSkill;

Scene_Skill.prototype.commandSkill = function() {
  if(Array.isArray(this._skillTypeWindow._skillWindow._stypeId) &&
  this._skillTypeWindow._skillWindow._stypeId[0] === 'set') {
    SceneManager.push(Scene_SkillChoice);
    SceneManager.prepareNextScene(this._skillTypeWindow._skillWindow._stypeId[1]);
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
  Scene_ItemBase.prototype.initialize.call(this, arguments);
};

Scene_SkillChoice.prototype.prepare = function(category) {
  this._category = category;
}

Scene_SkillChoice.prototype.create = function() {
  Scene_ItemBase.prototype.create.call(this);

  this.wm = new Kru.helpers.WindowManager(this);

  // Top Window: skill tree.
  let treeWin = this.wm.addWindow({
      width: 1,
      height: 0.75,
      type: 'skilltree',
      category: this._category
  });

  treeWin.window.activate();

  // Bottom Window: skill details.
  let infoWindow = this.wm.addWindow({
    width: 1,
    height: .25,
    type: 'help',
    content: '',
    setItem: function(item) {
      this.contents.clear();

      let content = '';
      if(item) {
        content = item.description;
      }
      this.setText(content);
    }
  });

  treeWin.window.setHelpWindow(infoWindow.window);
};
