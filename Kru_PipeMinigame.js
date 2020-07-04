/*:
 * Pipe Minigame
 *
 * @plugindesc 1.0 Creates a pipe minigame.
 *
 * @author Krusynth (https://billhunt.dev)
 *
 * @help
 *
 * Terms & Conditions
 * This plugin is MIT Licensed. (Free for non-commercial and commercial use.)
 *
 * Usage: add a custom script to an event, and run pipeminigame();
 *
 * You can pass parameters as well. E.g. pipeminigame({pieces: 3, rotate: true})
 * will allow the player to pick from three pieces and allow rotation of pieces.
 *
 * You'll need to check a variable within $gameTemp to see if the player
 * succeeded. This is customizable in the paramters, defaults to
 * $gameTemp['kru_pipegame'];
 *
 * @param Title
 * @default Pipe Game
 * @desc Title of the window
 *
 * @param Variable
 * @default kru_pipegame
 * @desc The key to store the result of the minigame within $gameTemp
 */

var Imported = Imported || {};
Imported.Kru_PipeMinigame = 1.0;

var Kru = Kru || {};
Kru.PM = {
  config: {}
};

Kru.PM.params = PluginManager.parameters('Kru_PipeMinigame');

if(!Imported.Kru_Core) {
  alert('Kru_PipeMinigame requires Kru_Core.');
  throw new Error('Kru_PipeMinigame requires Kru_Core.');
}


function pipeminigame(args) {
  args = args || {};
  $gameTemp[Kru.PM.params['Variable']] = null;
  SceneManager.push(Function.prototype.bind.call(Scene_PipeMinigame, null, args));
}

class Scene_PipeMinigame extends Scene_MenuBase {

  async initialize(args) {
    args = args || {};
    this.icon = args.icon || {
      width: 72,
      height: 72,
      set: 'pipetiles'
    };
    this.args = args;

    super.initialize(args);

    await this.loadIcons();
  }

  loadIcons(name) {
    name = name || this.icon.set;

    if(!this.bitmap) {
      this.bitmap = ImageManager.loadSystem(name);
      let wait = true;
      return new Promise(resolve => {
        this.bitmap.addLoadListener(() => {
          resolve();
        });
      });
    }
  }

  create() {
    super.create();
    // With our current window settings, 46px appears to be the chrome width.
    let _magicNumber = 46;
    let leftWidth = this.icon.width + _magicNumber;
    let rightWidth = Graphics.boxWidth - leftWidth;

    const wm = Kru.helpers.WindowManager(this);

    const titleWindow = wm.addWindow({
      width: 1,
      height: .12,
      content: 'Hacking'
    });

    const pieceWindow = wm.addWindow({
      name: 'pieceWindow',
      // width: .2,
      _w: leftWidth,
      height: this.args.rotate ? .76 : .88,
      type: 'piecelist',
      icon: this.icon,
      pieces: this.args.pieces,
      rotate: this.args.rotate
    });

    // We want to put the exit box underneath this, so we save our position.
    let bottom = wm.last._y + wm.last._h;

    const gridWindow = wm.addWindow({
      name: 'gridWindow',
      // width: .8,
      _w: rightWidth,
      height: .88,
      type: 'gamegrid',
      icon: this.icon
    });

    if(this.args.rotate) {
      const opWindow = wm.addWindow({
        // width: .2,
        _w: leftWidth,
        height: .12,
        content: ' ➡:  ⤵',
        _x: 0,
        _y: bottom
      });
    }

    pieceWindow.grid = gridWindow;
    gridWindow.pieceWindow = pieceWindow;

    pieceWindow.activate();
    pieceWindow.select(0);

    // TODO: use reference to this.bitmap in derived windows.

    return;
  }
}

/*
 * Create a window to show our available pieces.
 */
class Kru_PipeGame_PieceListWindow extends Kru_GenericListWindow {
  grid = null;

  initialize(win) {
    this.pieces = win.pieces || 1;
    this.frequency = win.frequency ||
    {
      'PieceL': 7,
      'PieceI': 4,
      'PieceT': 2,
      'PieceX': 1,
    };

    this.rotate = true;
    if(typeof win.rotate !== 'undefined') {
      this.rotate = win.rotate;
    }

    this._data = [];

    this._margin = win.margin || 10;
    this._offset = 5;

    this.setFrequency();
    this.initPieces();
    super.initialize(win);

    this.setHandler('ok', this.onOk.bind(this));
    this.setHandler('cancel', this.onCancel.bind(this));
  }

  async refresh() {
    await this.loadIcons();
    super.refresh();
  }

  initPieces() {
    for(let i = 0; i < this.pieces; i++) {
      this._data[i] = this.getPiece();
    }
  }

  getPiece() {
    let value = Math.floor(Math.random() * this._maxFrequency);
    value = 12; // TEST
    let keys = Object.keys(this._frequency);
    let piece = null;

    for(let i = 0; i < keys.length; i++) {
      let key = keys[i];
      if(value < this._frequency[key]) {
        piece = new Kru.PM.pieces[key]();
        // Randomize our rotation.
        piece.direction = Math.floor(Math.random() * piece.connections.length);

        break;
      }
    }
    return piece;
  }

  use() {
    let result = Object.assign({}, this.current);
    this._data[this.index()] = this.getPiece();
    this.refresh();

    return result;
  }

  setFrequency() {
    this._frequency = {};
    let keys = Object.keys(this.frequency);
    let sum = 0;
    for(let i = 0; i < keys.length; i++) {
      let key = keys[i];
      sum += this.frequency[key];
      this._frequency[key] = sum;
    }
    this._maxFrequency = sum;
  }

  onOk() {
    this.grid.piece = this.data
    this.grid.activate();
  }

  onCancel() {
    // Result = fail.
    $gameTemp[Kru.PM.params['Variable']] = false;

    this._win.scene.popScene();
  }

  drawItem(index) {
    let piece = this._data[index];
    let pos = this.positionAdjusted(index);

    this.drawIconIndex(piece.img[0], piece.img[1],
      pos[0]+this._offset, pos[1]+this._offset, piece.rotation);
  }

  itemRect(index) {
    let rect = new Rectangle();
    let pos = this.positionAdjusted(index);

    rect.x = pos[0];
    rect.y = pos[1];
    rect.width = this._iconWidth + (this._offset * 2);
    rect.height = this._iconHeight + (this._offset * 2);

    return rect;
  }

  positionAdjusted(index) {
    let x = 0;
    let y = (this._iconHeight + this._margin) * index;

    return [x, y];
  }

  select(index) {
    this._index = index;
    this._stayCount = 0;
    this.ensureCursorVisible();
    this.updateCursor();
  }

  // The piece window is a single row, but pieces are rotatable from this window.
  cursorDown(wrap) {
    if(this.maxItems() === 1) return;

    let newIndex = null;
    if(this.index() == this.maxItems() - 1 && wrap) {
      this.select(0);
    }
    else {
      this.select(this.index()+1);
    }
  };

  cursorUp(wrap) {
    if(this.maxItems() === 1) return;

    let newIndex = null;
    if(this.index() == 0 && wrap) {
      this.select(this.maxItems() - 1);
    }
    else {
      this.select(this.index()-1);
    }
  };

  cursorRight() {
    if(this.rotate) {
      this._data[this.index()].rotate(1);
      this.refresh();
    }
  };

  cursorLeft() {
    if(this.rotate) {
      this._data[this.index()].rotate(-1);
      this.refresh();
    }
  }
}

Kru.helpers.windowHandlers['piecelist'] = Kru_PipeGame_PieceListWindow;

class Kru_PipeGame_GridWindow extends Kru_GenericListWindow {

  initialize(win) {
    this.dim = win.dim || [6,6];

    this._lineHeight = win.icon.height;

    this._data = Array(this.dim[0] * this.dim[1]);
    this._data.fill(null);

    this._margin = win.margin || 3;
    this.offset = win.offset || [win.icon.width+(this._margin*2), this._margin*2];

    let goalCount = win.goals || 1;

    this.lineColor = win.lineColor || '#aaaaaa';

    this._goals = [
      this.getGoals(goalCount),
      this.getGoals(goalCount)
    ];

    this.goalConnected = Array(goalCount);
    this.goalConnected.fill(false);

    super.initialize(win);
    this._index = 0;

    // Set event handlers.
    this.setHandler('ok', this.onOk.bind(this));
    this.setHandler('cancel', this.onCancel.bind(this));

    Object.defineProperty(this, '__index', {
      get: function () {
        return this.__ItoXY(this._index);
      },
      set: function (xy) {
        this._index = this.__XYtoI(xy);
        return xy;
      }
    });
  }

  // Index to [X,Y]
  __ItoXY(index) {
    return [index % this.dim[0], Math.floor(index / this.dim[0])];
  }

  // [X,Y] to Index
  __XYtoI(xy) {
    return xy[0] + (xy[1] * this.dim[0]);
  }

  __data(xy, value) {
    let index = this.__XYtoI(xy);
    if(typeof value === 'undefined') {
      return this._data[index];
    }
    else {
      return this._data[index] = value;
    }
  }

  position(index) {
    let pos = this.__ItoXY(index);
    return [
      (pos[0] * (this._iconWidth  + this._margin)) + this.offset[0],
      (pos[1] * (this._iconHeight + this._margin)) + this.offset[1]
    ];
  }

  maxCols() {
    return this.dim[0];
  }

  maxItems() {
    return this.dim[0] * this.dim[1];
  }

  itemRect(index) {
    let rect = new Rectangle();
    let pos = this.position(index);

    rect.x = pos[0] - this._margin;
    rect.y = pos[1] - this._margin;
    rect.width = this._iconWidth + (this._margin * 2);
    rect.height = this._iconHeight + (this._margin * 2);

    return rect;
  }

  drawItem(index) {
    let content = this._data[index];
    if(content) {
      let piece = this._data[index];
      let pos = this.position(index);

      this.drawIconIndex(piece.img[0], piece.img[1], pos[0], pos[1], piece.rotation);
    }
  }

  drawGrid() {
    let off = Math.round(this._margin / 2);

    let min = this.offset;
    let max = this.position((this.dim[0] * (this.dim[1]+1)) - 1);
    max[0] += this._iconWidth;

    // vertical
    for(let i = 0; i <= this.dim[0]; i++) {
      let x = (i * (this._iconWidth + this._margin)) + this.offset[0]-off;
      this.contents.kDrawLine(x, min[1]-off, x, max[1]-off, this.lineColor, 2);
    }
    // horizontal
    for(let i = 0; i <= this.dim[1]; i++) {
      let y = (i * (this._iconHeight + this._margin)) + this.offset[1]-off;
      this.contents.kDrawLine(min[0]-off, y, max[0]+off, y, this.lineColor, 2);
    }

  }

  async drawStartAndEnd() {
    for(let i = 0; i < this._goals[0].length; i++) {
      let startX = 0;
      let startY = (this._goals[0][i] * (this._iconHeight + this._margin)) + this.offset[1];
      this.drawIconIndex(4, 1, startX, startY);
    }
    for(let i = 0; i < this._goals[1].length; i++) {
      let endY = (this._goals[1][i] * (this._iconHeight + this._margin)) + this.offset[1];
      let endX = (this.dim[0] * (this._iconWidth + this._margin)) + this.offset[0];
      this.drawIconIndex(5, 0 + this.goalConnected[i], endX, endY);
    }
  }

  getGoals(count) {
    let goals = [];
    do {
      let val = Math.floor(Math.random() * this.dim[1]);
      if(goals.indexOf(val) === -1) {
        goals.push(val);
      }
    } while( goals.length < count);
    return goals;
  }

  refresh() {
    this.contents.clear();
    this.drawGrid();
    this.drawStartAndEnd();
    this.drawAllItems();
  }

  onCancel() {
    this.deactivate();
    this.pieceWindow.activate();
  }

  onOk() {
    if(this._data[this._index] === null) {
      let args = this.pieceWindow.use();
      args = Object.assign(args, {
        index: this._index,
        dim: this.dim
      });

      let piece = new Piece(args);

      this._data[this._index] = piece;

      this.playOkSound();

      this.checkActives(piece);
      this.activateNeighbors(piece);

      this.refresh();

      if(this.checkComplete()) {
        // Do win.
        this.doSuccess();
      }


      if(this.pieceWindow.pieces > 1) {
        this.deactivate();
        this.pieceWindow.activate();
      }

    }
    else {
      this.playBuzzerSound();
      this.activate();
    }
  }

  doSuccess() {
    // TODO: add a little message or something.
    $gameTemp[Kru.PM.params['Variable']] = true;
    this._win.scene.popScene();
  }


  checkActives(piece) {
    // Check for the start point.
    if(piece.x === 0) {
      for(let i = 0; i < this._goals[0].length; i++) {
        if(this._goals[0][i] == piece.y) {
          piece.active = true;
          break;
        }
      }
    }

    let neighbors = piece.neighbors();
    if(!piece.active) {
      for(let i = 0; i < neighbors.length; i++) {
        if(typeof neighbors[i] == 'undefined') continue;
        let neighbor = this._data[neighbors[i]];

        if(neighbor && neighbor.active && neighbor.opSide(i)) {
          piece.active = true;
        }
      }
    }
  }

  activateNeighbors(piece) {
    if(piece.active) {
      let neighbors = piece.neighbors();
      for(let i = 0; i < neighbors.length; i++) {
        let neighbor = this._data[neighbors[i]];

        if(neighbor && !neighbor.active && neighbor.opSide(i)) {
          neighbor.active = true;
          this.activateNeighbors(neighbor);
        }
      }
    }
  }

  checkComplete() {
    let actives = 0;
    for(let i = 0; i < this._goals[1].length; i++) {
      let index = this.__XYtoI([this.dim[0]-1, this._goals[1][i]]);
      let piece = this._data[index];

      if(piece && piece.side(1) && piece.active) {
        actives++;
        this.goalConnected[i] = true;
      }
    }

    return actives == this._goals[1].length;
  }
}

Kru.helpers.windowHandlers['gamegrid'] = Kru_PipeGame_GridWindow;

Kru.PM.pieces = {};
class Piece {
  direction = 0;
  index = null;
  dim = [null, null];
  //   0
  // 3   1
  //   2
  connections = [];

  active = false;
  _img = null;

  constructor(options) {
    for(name in options) {
      this[name] = options[name];
    }

    Object.defineProperty(this, 'img', {
      get: function () { return [this._img, 0+this.active] }
    });

    Object.defineProperty(this, 'rotation', {
      get: function () { return this.direction * 90 }
    });

    Object.defineProperty(this, 'x', {
      get: function () { return this.index % this.dim[0]; }
    });
    Object.defineProperty(this, 'y', {
      get: function () { return Math.floor(this.index / this.dim[0]); }
    });

    Object.defineProperty(this, 'xy', {
      get: function () {
        return [this.x, this.y];
      }
    });
  }

  rotate(n) {
    if(typeof n === 'undefined') {
      n = 1;
    }

    let d = (this.direction + n) % this.connections.length;;

    if(d < 0) {
      d = this.connections.length + n ;
    }

    this.direction = d;
  }

  // Is there a connection on the given side?
  side(side) {
    // Take our given side, subtract our rotation (direction), add the maximum
    // number of sides so this can't possibly be negative, and then return the
    // modulo.
    let n = (side + this.connections.length - this.direction) % this.connections.length;
    return this.connections[n];
  }

  // Is there a connection on the opposite side?
  opSide(side) {
    // Take our given side, subtract our rotation (direction), add the maximum
    // number of sides so this can't possibly be negative, add half again our
    // number of sides to do a 180 rotation, and then return the modulo.
    let n = (side + this.connections.length - this.direction + Math.floor(this.connections.length / 2))
              % this.connections.length;
    return this.connections[n];
  }


  sideName(side) {
    switch (side) {
      case 0: return 'up';
      case 1: return 'right';
      case 2: return 'down';
      case 3: return 'left';
    }
  }

  // Index to [X,Y]
  __ItoXY(index) {
    return [index % this.dim[0], Math.floor(index / this.dim[0])];
  }

  // [X,Y] to Index
  __XYtoI(xy) {
    return xy[0] + (xy[1] * this.dim[0]);
  }

  up(n) {
    n = n || 1;
    if(this.side(0) && this.y - n >= 0) {
      return this.__XYtoI([this.x, this.y - n]);
    }
  }

  right(n) {
    n = n || 1;
    if(this.side(1) && this.x + n <= this.dim[0]) {
      return this.__XYtoI([this.x + n, this.y]);
    }
  }

  down(n) {
    n = n || 1;
    if(this.side(2) && this.y + n <= this.dim[1]) {
      return this.__XYtoI([this.x, this.y + n]);
    }
  }

  left(n) {
    n = n || 1;
    if(this.side(3) && this.x - n >= 0) {
      return this.__XYtoI([this.x - n, this.y]);
    }
  }

  neighbor(side, n) {
    switch(side) {
      case 0: return this.up(n);
      case 1: return this.right(n);
      case 2: return this.down(n);
      case 3: return this.left(n);
    }
  }

  neighbors() {
    let neighbors = [];
    for(let i = 0; i < this.connections.length; i++) {
      if(this.side(i)) {
        neighbors[i] = this.neighbor(i);
      }
    }
    return neighbors;
  }
}

class PieceX extends Piece {
  name = 'X';
  _img = 2;
  connections = [true, true, true, true];
}
Kru.PM.pieces['PieceX'] = PieceX;

class PieceT extends Piece {
  name = 'T';
  _img = 3;
  connections = [true, true, false, true];
}
Kru.PM.pieces['PieceT'] = PieceT;

class PieceI extends Piece {
  name = 'I';
  _img = 0;
  connections = [true, false, true, false]
}
Kru.PM.pieces['PieceI'] = PieceI;

class PieceL extends Piece {
  name = 'L';
  _img = 1;
  connections = [true, true, false, false]
}
Kru.PM.pieces['PieceL'] = PieceL;