'use strict'

const Uncertainty = 1e-8;
function compareWithNull(number) {
  return -Uncertainty <= number && number <= Uncertainty;
}

class Graph {
  static count = 0;
  static margin = 50;
  static interval = 40;
  static list = [];
  static resize() {
    app.canvas.renderer.resize(
      app.canvas.screen.width,
      Graph.count * Graph.height + Graph.count * 2 * Graph.margin
    );
  };
  constructor(xAlias = 'x', yAlias = 'y') {
    this.count = ++Graph.count;
    Graph.list.push(this);
    Graph.resize();

    this.container = new PIXI.Container();
    this.container.x += Graph.margin;
    this.container.y += this.count * Graph.height + 2 * this.count * Graph.margin - Graph.margin;
    app.canvas.stage.addChild(this.container);
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
    xLine.moveTo(this.x0, this.y0);
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
    yLine.moveTo(this.x0, this.y0);
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
    //TODO:
    //добавить плавное удаление графика
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
    if (app.stopped) return;
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

class Physics {
  constructor(x, y, args) {
    this.x = x;
    this.y = y;
    this.v = [args.velocityModul, args.radianThrowingAngle]
    this.vmax = args.vmax;
    this.wind = args.wind;
    this.t = 0;

    this.listeners = {
        stop: new Set()
    };
  }
  set x(value) {
    this._x = value;
    app.setInputValue('x', +value.toFixed(1));
  }
  get x() {
    return this._x;
  }
  set y(value) {
    this._y = value;
    app.setInputValue('y', +value.toFixed(1));
  }
  get y() {
    return this._y;
  }
  // set degreeThrowingAngle(value) {
  //   this._degreeThrowingAngle = value;
  //   if (this.v !== undefined) app.applyUpdatedInputValue('v'); //скорость изменяется при изменении угла
  //   app.setInputValue('throwing-angle', Math.floor(value));
  // }
  // get degreeThrowingAngle() {
  //   return this._degreeThrowingAngle;
  // }
  set v([modul, angle]) {
    //const radian = this.degreeThrowingAngle * Math.PI / 180;
    if (compareWithNull(modul))
      this._v = new Vector(Math.cos(angle), Math.sin(angle));
    else
      this._v = new Vector(Math.cos(angle) * modul, Math.sin(angle) * modul);
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
    //g - e^()-h / 10000) * g.modul * (v - wind) * (v - wind).modul
    const relativeVelocity = Vector.expression(this.v, '-', this.wind);
    return Vector.expression(
      g,
      '-',
      relativeVelocity.scalar(
        + Math.exp(-this.y / 10000)
        * relativeVelocity.modul
        * g.modul
      ).scalar(
        1 / Math.pow(this.vmax, 2)
      )
    );
  }
  start() {
    if (this.moving) return;

    this.drawingGraph = setInterval(() => {
      shGraph.add(this.x, this.y);
      vtGraph.add(this.t, this.v.modul);
      tvxGraph.add(this.t, this.v.x);
      tvyGraph.add(this.t, this.v.y);
    }, Graph.interval);

    this.moving = (delta) => {
      //NOTE:
      //delta является отношением количества отрисованных кадров
      //за секунду времени (в данной программе - не более 60 FPS)
      //т.е. если за секунду времени отрисовано 60 кадров, delta = 1,
      //а если меньше 60 кадров, то delta < 1
      delta /= 60;
      this.t += delta;
      this.x += this.v.x * delta;
      this.y += this.v.y * delta;
      const a = this.a().scalar(delta);
      this._v = Vector.expression(this.v, '+', a);
      if (this.y <= 0) this.stop();
    };

    app.canvas.ticker.add(this.moving);
  }
  stop() {
    this.t = 0;
    app.canvas.ticker.remove(this.moving);
    delete this.moving;
    clearInterval(this.drawingGraph);
    delete this.drawingGraph;
    this.emit('stop');
  }
  emit(type) {
    this.listeners[type].forEach(fn => fn());
    this.listeners[type].clear();
  }
  on(type, callback) {
    this.listeners[type].add(callback);
  }
}

const app = ((exports) => {
  let stopped = false;
  let link = null;
  const canvasBackground = 0xF0F0F0;
  const inputs = {
    x: document.getElementById('input-x'),
    y: document.getElementById('input-y'),
    v: document.getElementById('input-v'),
    wind: document.getElementById('input-wind'),
    throwingAngle: document.getElementById('input-throwing-angle'),
    vmax: document.getElementById('input-vmax')
  };
  const mainWidth = document.getElementsByTagName('main')[0].clientWidth;
  const canvas = new PIXI.Application({
    width: Math.floor(mainWidth * (mainWidth <= 800 ? 0.9 : 0.4)),
    height: 0,
    backgroundColor: canvasBackground,
    //NOTE: antialias добавляет сглаживание
    //antialias: true
  });
  Graph.width = canvas.screen.width - 2 * Graph.margin;
  Graph.height = Math.floor(Graph.width / 16 * 9);
  document.getElementById('canvas').appendChild(canvas.view);

  function getInputValue(inputType) {
    switch (inputType) {
      case 'x': return inputs.x.valueAsNumber;
      case 'y': return inputs.y.valueAsNumber;
      case 'v': return inputs.v.valueAsNumber;
      case 'wind': return inputs.wind.valueAsNumber;
      case 'throwing-angle': return inputs.throwingAngle.valueAsNumber;
      case 'vmax': return inputs.vmax.valueAsNumber;
    }
  }

  function setInputValue(inputType, value) {
    switch (inputType) {
      case 'x': inputs.x.valueAsNumber = value; break;
      case 'y': inputs.y.valueAsNumber = value; break;
      case 'v': inputs.v.valueAsNumber = value; break;
      case 'wind': inputs.wind.valueAsNumber = value; break;
      case 'throwing-angle': inputs.throwingAngle.valueAsNumber = value; break;
      case 'vmax': inputs.vmax.valueAsNumber = value; break;
    }
  }

  function applyUpdatedInputValue(inputType) {
    if (link === null) return;
    switch (inputType) {
      case 'x': link.x = getInputValue(inputType); break;
      case 'y': link.y = getInputValue(inputType); break;
      case 'v': link.v = [
        getInputValue(inputType),
        getInputValue('throwing-angle') * Math.PI / 180
      ]; break;
      case 'wind': link.wind.x = getInputValue(inputType); break;
      case 'throwing-angle': link.v = [
        getInputValue('v'),
        getInputValue(inputType) * Math.PI / 180
      ]; break;
      case 'vmax': link.vmax = getInputValue(inputType);
    }
  }

  function linkTo(physics) {
    link = physics;
  }

  function start() {
    const startButton = document.getElementById('start-button');
    const stopButton = document.getElementById('stop-button');
    startButton.style.display = 'none';
    stopButton.style.display = 'inline-block';
    stopped = false;
    canvas.ticker.start();
    if (!link.moving) {
      Graph.list.forEach(graph => graph.startProject());
      link.on('stop', () => {
        Graph.list.forEach(graph => graph.endProject());
        startButton.style.display = 'inline-block';
        stopButton.style.display = 'none';
      });
      link.start();
    }
  }

  function stop() {
    document.getElementById('start-button').style.display = 'inline-block';
    document.getElementById('stop-button').style.display = 'none';
    stopped = true;
    canvas.ticker.stop();
  }

  function defaultValues() {
    setInputValue('x', 0); applyUpdatedInputValue('x');
    setInputValue('y', 0); applyUpdatedInputValue('y');
    setInputValue('v', 750); applyUpdatedInputValue('v');
    setInputValue('throwing-angle', 45); applyUpdatedInputValue('throwing-angle');
    setInputValue('wind', 0); applyUpdatedInputValue('wind');
    setInputValue('vmax', 150); applyUpdatedInputValue('vmax');
  }

  function pixiTickerSpeed(to) {
    if (canvas.ticker.speed + to <= 0) return;
    document.getElementById('input-pixi-ticker-speed').value = canvas.ticker.speed += to;
  }

  exports.canvas = canvas;

  exports.getInputValue = getInputValue;
  exports.setInputValue = setInputValue;
  exports.applyUpdatedInputValue = applyUpdatedInputValue;
  exports.start = start;
  exports.stop = stop;
  exports.linkTo = linkTo;
  exports.pixiTickerSpeed = pixiTickerSpeed;
  exports.defaultValues = defaultValues;

  return exports;
})({});

const shGraph = new Graph('S', 'h');
const vtGraph = new Graph('t', 'V');
const tvxGraph = new Graph('t', 'Vx');
const tvyGraph = new Graph('t', 'Vy');
const g = new Vector(0, -9.81);
const p = new Physics(
  app.getInputValue('x'),
  app.getInputValue('y'),
  {
    velocityModul: app.getInputValue('v'),
    radianThrowingAngle: app.getInputValue('throwing-angle') * Math.PI / 180,
    vmax: app.getInputValue('vmax'),
    wind: app.getInputValue('wind')
  }
);
app.linkTo(p);
