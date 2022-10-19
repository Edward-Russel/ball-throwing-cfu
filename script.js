'use strict';

const Uncertainty = 1e-8;

class App {
  constructor() {
    this.scale = 100; //100 px == 1 m
    this.stoped = false;

    this.canvasBackground = 0xF0F0F0;

    this.inputs = {
      x: document.getElementById('input-x'),
      y: document.getElementById('input-y'),
      v: document.getElementById('input-v'),
      wind: document.getElementById('input-wind'),
      throwingAngle: document.getElementById('input-throwing-angle')
    }
    this.main = document.getElementsByTagName('main')[0];
  }
  addView() {
    const subViewHTML = document.getElementById('sub-view');
    const mainViewHTML = document.getElementById('main-view');
    const mainView = new PIXI.Application({
      width: Math.floor(this.main.clientWidth * 0.4),
      height: this.main.clientHeight,
      backgroundColor: this.canvasBackground,
      //antialias: true
    });
    const subView = new PIXI.Application({
      width: subViewHTML.clientWidth,
      height: 0,
      backgroundColor: this.canvasBackground,
      //antialias: true
    });
    this.mainView = mainView;
    this.subView = subView;
    Graph.width = subView.screen.width - 2 * Graph.margin;
    Graph.height = Math.floor(Graph.width / 16 * 9);
    mainViewHTML.appendChild(mainView.view);
    subViewHTML.appendChild(subView.view);
  }
  getInputValue(inputType) {
    switch (inputType) {
      case 'x': return this.inputs.x.valueAsNumber;
      case 'y': return this.inputs.y.valueAsNumber;
      case 'v': return this.inputs.v.valueAsNumber;
      case 'wind': return this.inputs.wind.valueAsNumber;
      case 'throwing-angle': return this.inputs.throwingAngle.valueAsNumber;
    }
  }
  setInputValue(inputType, value) {
    switch (inputType) {
      case 'x': this.inputs.x.valueAsNumber = value; break;
      case 'y': this.inputs.y.valueAsNumber = value; break;
      case 'v': this.inputs.v.valueAsNumber = value; break;
      case 'wind': this.inputs.wind.valueAsNumber = value; break;
      case 'throwing-angle': this.inputs.throwingAngle.valueAsNumber = value; break;
    }
  }
  applyUpdatedInputValue(inputType) {
    switch (inputType) {
      case 'x': p.x = this.inputs.x.valueAsNumber; break;
      case 'y': p.y = this.inputs.y.valueAsNumber; break;
      case 'v': p.v = this.inputs.v.valueAsNumber; break;
      case 'wind': p.wind.x = this.inputs.wind.valueAsNumber; break;
      case 'throwing-angle': p.degreeThrowingAngle = this.inputs.throwingAngle.valueAsNumber; break;
    }
  }
  start() {
    this.stoped = false;
    this.mainView.ticker.start();
    this.subView.ticker.start();
  }
  stop() {
    this.stoped = true;
    this.mainView.ticker.stop();
    this.subView.ticker.stop();
  }
}

class Graph {
  static count = 0;
  static margin = 40;
  static interval = 1;
  static list = [];
  static resize() {
    app.subView.renderer.resize(
      app.subView.screen.width,
      Graph.count * Graph.height + 2 * (Graph.count - 1) * Graph.margin
    );
    app.mainView.renderer.resize(
      app.mainView.screen.width,
      app.main.clientHeight - 4
    )
  };
  constructor(xAlias = 'x', yAlias = 'y') {
    this.count = ++Graph.count;
    Graph.list.push(this);
    Graph.resize();
    this.container = new PIXI.Container();
    this.container.x += Graph.margin;
    this.container.y += this.count * Graph.height + this.count * Graph.margin;
    app.subView.stage.addChild(this.container);
    this.x0 = 0;
    this.y0 = 0;
    this.x = Graph.width;
    this.y = -Graph.height;

    const arrow = 5;
    const textStyle = new PIXI.TextStyle({ fontSize: 14 });

    this.pointContainer = new PIXI.Container();
    this.container.addChild(this.pointContainer);

    this.xMinValueText = new PIXI.Text('', textStyle);
    this.xMinValueText.position.set(this.x0, this.y0);
    this.xMaxValueText = new PIXI.Text('', textStyle);
    this.xMaxValueText.position.set(this.x, this.y0 - this.xMaxValueText.height);
    this.yMinValueText = new PIXI.Text('', textStyle);
    this.yMinValueText.position.set(this.x0, this.y0);
    this.yMaxValueText = new PIXI.Text('', textStyle);
    this.yMaxValueText.position.set(this.x0, this.y - this.yMaxValueText.height);

    this.horizontalLine = new PIXI.Container();
    const xLine = new PIXI.Graphics();
    const xText = new PIXI.Text(xAlias, textStyle);
    xLine.lineStyle({ width: 1 });
    xLine.lineTo(this.x + Graph.margin / 2, this.y0);
    xLine.lineTo(this.x + Graph.margin / 2 - arrow, this.y0 - arrow);
    xLine.moveTo(this.x + Graph.margin / 2, this.y0);
    xLine.lineTo(this.x + Graph.margin / 2 - arrow, this.y0 + arrow);
    xLine.moveTo(this.x0, this.y0 - arrow);
    xLine.lineTo(this.x0, this.y0 + arrow);
    xLine.moveTo(this.x, this.y0 + arrow);
    xLine.lineTo(this.x, this.y0 - arrow);
    xLine.closePath();
    xText.position.set(this.x, this.y0);
    this.horizontalLine.addChild(
      xLine,
      xText,
      this.xMinValueText,
      this.xMaxValueText
    );
    this.container.addChild(this.horizontalLine);


    this.verticalLine = new PIXI.Container();
    const yLine = new PIXI.Graphics();
    const yText = new PIXI.Text(yAlias, textStyle);
    yLine.lineStyle({ width: 1 });
    yLine.lineTo(this.x0, this.y - Graph.margin / 2);
    yLine.lineTo(this.x0 - arrow, this.y - Graph.margin / 2 + arrow);
    yLine.moveTo(this.x0, this.y - Graph.margin / 2);
    yLine.lineTo(this.x0 + arrow, this.y - Graph.margin / 2 + arrow);
    yLine.moveTo(this.x0 - arrow, this.y0);
    yLine.lineTo(this.x0 + arrow, this.y0);
    yLine.moveTo(this.x0 - arrow, this.y);
    yLine.lineTo(this.x0 + arrow, this.y);
    yLine.closePath();
    yText.position.set(this.x0 - yText.width - arrow, this.y - yText.height);
    this.verticalLine.addChild(
      yLine,
      yText,
      this.yMinValueText,
      this.yMaxValueText
    );
    this.container.addChild(this.verticalLine);

    this.xMinValue = Uncertainty;
    this.xMaxValue = Uncertainty;
    this.yMinValue = Uncertainty;
    this.yMaxValue = Uncertainty;
    this.activeProject = null;
    this.projects = [];
  }
  set yMinValue(value) {
    this._yMinValue = value;
    if (!compareWithNull(value)) this.yMinValueText.text = +value.toFixed(2);
  }
  get yMinValue() {
    return this._yMinValue;
  }
  set yMaxValue(value) {
    this._yMaxValue = value;
    if (!compareWithNull(value)) this.yMaxValueText.text = +value.toFixed(2);
  }
  get yMaxValue() {
    return this._yMaxValue;
  }
  set xMinValue(value) {
    this._xMinValue = value;
    if (!compareWithNull(value)) this.xMinValueText.text = +value.toFixed(2);
  }
  get xMinValue() {
    return this._xMinValue;
  }
  set xMaxValue(value) {
    this._xMaxValue = value;
    if (!compareWithNull(value)) this.xMaxValueText.text = +value.toFixed(2);
  }
  get xMaxValue() {
    return this._xMaxValue;
  }
  set activeProject(value) {
    this.activeProjectIndex = value;
  }
  get activeProject() {
    if (this.activeProjectIndex === null) return null;
    return this.projects[this.activeProjectIndex];
  }
  startProject() {
    if (this.activeProject) return;
    const index = this.projects.length;
    this.activeProject = index;
    this.projects.push({
      index,
      values: [],
      xMinValue: Uncertainty,
      xMaxValue: Uncertainty,
      yMinValue: Uncertainty,
      yMaxValue: Uncertainty
    });
  }
  endProject() {
    const project = this.activeProject;
    if (project === null) return;
    if (project.values.length === 0) this.projects.pop();
    this.activeProject = null;
    if (this.projects.length > 2) this.shiftProject();
  }
  computeMinMax(context, x, y) {
    if (x < context.xMinValue) context.xMinValue = x;
    else if (x > context.xMaxValue) context.xMaxValue = x;
    if (y < context.yMinValue) context.yMinValue = y;
    else if (y > context.yMaxValue) context.yMaxValue = y;
  }
  shiftProject() {
    //сохранить прошлые минмакс значения, потом плавно от них к новым
    //минмаксам маштабировать график, параллельно удаля точки
    this.projects.shift();
    this.xMinValue = Uncertainty;
    this.xMaxValue = Uncertainty;
    this.yMinValue = Uncertainty;
    this.yMaxValue = Uncertainty;
    for (let i = 0; i < this.projects.length; i++) {
      this.activeProject = i;
      const project = this.activeProject;
      this.computeMinMax(this, project.xMinValue, project.yMinValue);
      this.computeMinMax(this, project.xMaxValue, project.yMaxValue);
    }
    this.activeProject = null;
    this.draw();
  }
  add(x, y) {
    if (app.stoped) return;
    const project = this.activeProject;

    this.computeMinMax(project, x, y);
    this.computeMinMax(this, x, y);

    project.values.push([x, y]);
    this.draw();
  }
  draw() {
    this.pointContainer.removeChildren();
    const pixelPerX = Graph.width / (Math.abs(this.xMinValue) + this.xMaxValue);
    const pixelPerY = Graph.height / (Math.abs(this.yMinValue) + this.yMaxValue);
    const shiftX = -this.xMinValue * pixelPerX;
    const shiftY = this.yMinValue * pixelPerY;
    this.pointContainer.x = shiftX;
    this.verticalLine.x = shiftX;
    this.pointContainer.y = shiftY;
    this.horizontalLine.y = shiftY;
    this.projects.forEach(project => {
      project.values.forEach(([x, y]) => {
        const point = new PIXI.Graphics();
        const pointColor = this.getColorFor(y, project);
        point.lineStyle({ width: 0 });
        point.beginFill(pointColor, 1);
        point.drawCircle(Math.floor(x * pixelPerX), -Math.floor(y * pixelPerY), 2);
        point.endFill();
        this.pointContainer.addChild(point);
      });
    });
  }
  rgb(r, g, b) {
    r = Math.floor(r) << 16;
    g = Math.floor(g) << 8;
    b = Math.floor(b);
    return r + g + b;
  }
  getColorFor(y, targetProject) {
    if (compareWithNull(y)) return this.rgb(0, 255, 0);
    const limit = y > 0 ? targetProject.yMaxValue : targetProject.yMinValue;
    const t = Math.abs(y / limit);
    if (t >= 1/2) return this.rgb(255, (1 - t) * 510, 0);
    else return this.rgb(t * 510, 255, 0);
  }
}

class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  static expression(a, operator, b) {
    switch (operator) {
      case '+': return new Vector(a.x + b.x, a.y + b.y);
      case '-': return new Vector(a.x - b.x, a.y - b.y);
      case '*': {
        //скалярное умножение векторов
        if (isNaN(b)) return a.x * b.x + a.y * b.y;
        //умножение на скаляр, возвращение нового вектора
        return new Vector(a.x * b, a.y * b);
      }
      //изменить направление вектора, возвращение нового вектора
      case '!': return new Vector(-a.x, -a.y);
    }
  }
  //умножение на скаляр, изменение текущего вектора
  scalar(scalar) {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }
  //изменить направление текущего вектора
  reverse() {
    this.x = -this.x;
    this.y = -this.y;
    return this;
  }
  //модуль текущего вектора
  get modul() {
    return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
  }
}

class Point {
  constructor() {
    this.container = new PIXI.Graphics();
    this.x = app.getInputValue('x');
    this.y = app.getInputValue('y');
    this.degreeThrowingAngle = app.getInputValue('throwing-angle');
    this.v = app.getInputValue('v');
    this.wind = app.getInputValue('wind');
    this.r = 0.05;
    this.aerodynamics = 0.3;
    this.s = Math.PI * Math.pow(2 * this.r, 2) / 4;
    this.t = 0;

    this.container.lineStyle({ width: 0 });
    this.container.beginFill(0xDE3249, 1);
    this.container.drawCircle(
      this.r * app.scale,
      app.mainView.screen.height - this.r * app.scale,
      this.r * app.scale
    );
    this.container.endFill();
    app.mainView.stage.addChild(this.container);

    this.listeners = {
        stop: new Set()
    };
  }
  set x(value) {
    this._x = value;
    this.container.position.x = Math.round(value * app.scale);
    app.setInputValue('x', +value.toFixed(1));
  }
  get x() {
    return this._x;
  }
  set y(value) {
    this._y = value;
    this.container.position.y = -Math.round(value * app.scale);
    app.setInputValue('y', +value.toFixed(1));
  }
  get y() {
    return this._y;
  }
  set degreeThrowingAngle(value) {
    this._degreeThrowingAngle = value;
    if (this.v !== undefined) app.applyUpdatedInputValue('v'); //скорость изменяется при изменении угла
    app.setInputValue('throwing-angle', Math.floor(value));
  }
  get degreeThrowingAngle() {
    return this._degreeThrowingAngle;
  }
  set v(value) {
    if (isNaN(value)) {
      this._v = value;
    } else {
      const radian = this.degreeThrowingAngle * Math.PI / 180;
      this._v = new Vector(Math.cos(radian) * value, Math.sin(radian) * value);
    }
    app.setInputValue('v', +((value < 0 ? -1 : 1) * this.v.modul).toFixed(2));
  }
  get v() {
    return this._v;
  }
  set wind(value) {
    this._wind = new Vector(value, 0);
  }
  get wind() {
    return this._wind;
  }
  a() {
    return Vector.expression(
      g,
      '-',
      Vector.expression(this.v, '-', this.wind).scalar(
        + Vector.expression(this.v, '-', this.wind).modul
        * Math.exp(-this.y / 10000)
        * this.aerodynamics
        * g.modul
        * this.s
      )
    );
  }
  start() {
    if (this.moving) return;
    this.drawingGraph = setInterval(() => {
      shGraph.add(this.x, this.y);
      tvyGraph.add(this.t, this.v.y);
      tvxGraph.add(this.t, this.v.x);
    }, 50 * Graph.interval);
    this.moving = (delta) => {
      delta /= 60;
      const a = this.a().scalar(delta);
      this.v = Vector.expression(this.v, '+', a);
      this.x += this.v.x * delta;
      this.y += this.v.y * delta;
      this.t += delta;
      this.collision();
      if (this.v.modul === 0) this.stop();
    };
    app.mainView.ticker.add(this.moving);
  }
  stop() {
    app.mainView.ticker.remove(this.moving);
    delete this.moving;
    clearInterval(this.drawingGraph);
    delete this.drawingGraph;
    this.fire('stop');
  }
  collision() {
    const maxX = app.mainView.screen.width / app.scale - this.r;
    let collision = false;
    if (this.x <= 0) {
      this.x = 0;
      this.v.reverse();
      collision = true;
    } else if (this.x >= maxX) {
      this.x = maxX;
      this.v.reverse();
      collision = true;
    }
    if (this.y <= 0) {
      this.y = 0;
      this.degreeThrowingAngle = Math.acos(this.v.x / this.v.modul) * 180 / Math.PI;
      this.v = Math.floor(this.v.modul / 1.2);
      collision = true;
    }
    return collision;
  }
  fire(type) {
    this.listeners[type].forEach(fn => fn());
    this.listeners[type].clear();
  }
  on(type, callback) {
    this.listeners[type].add(callback);
  }
}

const app = new App();

app.addView();

const shGraph = new Graph('S', 'h');
const tvyGraph = new Graph('t', 'Vy');
const tvxGraph = new Graph('t', 'Vx');
const g = new Vector(0, -9.81);
const p = new Point();

function start() {
  const startButton = document.getElementById('start-button');
  const stopButton = document.getElementById('stop-button');
  startButton.style.display = 'none';
  stopButton.style.display = 'inline-block';
  app.start();
  if (!p.moving) {
    Graph.list.forEach(graph => graph.startProject());
    p.on('stop', () => {
      Graph.list.forEach(graph => graph.endProject());
      startButton.style.display = 'inline-block';
      stopButton.style.display = 'none';
    });
    p.start();
  }
}

function stop() {
  document.getElementById('start-button').style.display = 'inline-block';
  document.getElementById('stop-button').style.display = 'none';
  app.stop();
}

function compareWithNull(number) {
  return -Uncertainty <= number && number <= Uncertainty;
}

function defaultValues() {
  app.setInputValue('x', 0);
  app.applyUpdatedInputValue('x');
  app.setInputValue('y', 0);
  app.applyUpdatedInputValue('y');
  app.setInputValue('v', 12);
  app.applyUpdatedInputValue('v');
  app.setInputValue('throwing-angle', 45);
  app.applyUpdatedInputValue('throwing-angle');
  app.setInputValue('wind', 0);
  app.applyUpdatedInputValue('wind');
}
