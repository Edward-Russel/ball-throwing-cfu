const Vector = ((exports) => {
  'use strict'

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
    reverse(reverseX = true, reverseY = true) {
      if (reverseX) this.x = -this.x;
      if (reverseY) this.y = -this.y;
      return this;
    }
    copy() {
      return new Vector(this.x, this.y);
    }
    //модуль текущего вектора
    get modul() {
      return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }
  }

  exports = Vector;

  return exports;
})();
