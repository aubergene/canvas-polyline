import bezier from "adaptive-bezier-curve";
import quadratic from "adaptive-quadratic-curve";
import {
  identity,
  rotate,
  scale,
  translate,
  fromObject,
  toString,
  fromString,
  compose,
  applyToPoint,
  inverse,
} from "transformation-matrix";

const pi = Math.PI;
const tau = 2 * pi;
const epsilon = 1e-6;
const defaultCurveScale = 2;
const defaultArcScale = 3;

export default class CanvasPolyLine {
  constructor() {
    this._line = [];
    this._lines = [this._line];
    this._arcScale = defaultArcScale;
    this._curveScale = defaultCurveScale;
    this._transformStack = [];
    this.beginPath();
    this.resetTransform();
  }

  set arcScale(scale) {
    this._arcScale = scale;
  }
  set curveScale(scale) {
    this._curveScale = scale;
  }

  rotate(a, cx, cy) {
    this._matrix = compose(this._matrix, rotate(a, cx, cy));
  }
  scale(sx, sy) {
    this._matrix = compose(this._matrix, scale(sx, sy));
  }
  translate(tx, ty) {
    this._matrix = compose(this._matrix, translate(tx, ty));
  }
  transform(a, b, c, d, e, f) {
    this._matrix = compose(this._matrix, fromObject({ a, b, c, d, e, f }));
  }
  resetTransform() {
    this._matrix = identity();
  }
  save() {
    this._transformStack.push(toString(this._matrix));
  }
  restore() {
    if (this._transformStack.length) {
      this._matrix = fromString(this._transformStack.pop());
    }
  }

  clear() {
    this._line = [];
    this._lines = [this._lines];
  }

  beginPath() {
    this._x0 = this._y0 = null; // start of current subpath
    this._x1 = this._y1 = null; // end of current subpath
    if (this._line.length) {
      this._lines.push(this._line);
      this._line = [];
    }
  }
  moveTo(x, y) {
    [x, y] = applyToPoint(this._matrix, [x, y]);
    this._x0 = this._x1 = +x;
    this._y0 = this._y1 = +y;
    if (this._line.length) {
      this._line = [];
      this._lines.push(this._line);
    }
  }
  lineTo(x, y) {
    [x, y] = applyToPoint(this._matrix, [x, y]);
    this._x1 = +x;
    this._y1 = +y;
    if (!this._line.length) {
      this._line.push([this._x0, this._y0]);
    }
    this._line.push([this._x1, this._y1]);
  }
  closePath() {
    if (this._x1 !== null) {
      const start = applyToPoint(inverse(this._matrix), [this._x0, this._y0]);
      this.lineTo(start[0], start[1]);
    }
  }
  quadraticCurveTo(x1, y1, x, y) {
    const start = applyToPoint(inverse(this._matrix), [this._x1, this._y1]);
    const end = applyToPoint(this._matrix, [x, y]);
    const points = quadratic(start, [x1, y1], [+x, +y], +this._curveScale);
    this._x1 = end[0];
    this._y1 = end[1];
    points.forEach((p) => {
      this.lineTo(p[0], p[1]);
    });
  }
  bezierCurveTo(x1, y1, x2, y2, x, y) {
    const start = applyToPoint(inverse(this._matrix), [this._x1, this._y1]);
    const end = applyToPoint(this._matrix, [x, y]);

    const points = bezier(
      start,
      [x1, y1],
      [x2, y2],
      [+x, +y],
      +this._curveScale
    );
    this._x1 = end[0];
    this._y1 = end[1];
    points.forEach((p) => {
      this.lineTo(p[0], p[1]);
    });
  }
  arc(x, y, r, a0, a1, ccw = false) {
    this.ellipse(x, y, r, r, 0, a0, a1, ccw);
  }
  arcTo(x1, y1, x2, y2, r) {
    (x1 = +x1), (y1 = +y1), (x2 = +x2), (y2 = +y2), (r = +r);

    var [x0, y0] = applyToPoint(inverse(this._matrix), [this._x1, this._y1]);

    var x21 = x2 - x1,
      y21 = y2 - y1,
      x01 = x0 - x1,
      y01 = y0 - y1,
      l01_2 = x01 * x01 + y01 * y01;

    // Is the radius negative? Error.
    if (r < 0) throw new Error("negative radius: " + r);

    // Is this path empty? Move to (x1,y1).
    if (this._x1 === null) {
      this.moveTo(x1, y1);
    }

    // Or, is (x1,y1) coincident with (x0,y0)? Do nothing.
    else if (!(l01_2 > epsilon));
    else if (!(Math.abs(y01 * x21 - y21 * x01) > epsilon) || !r) {
      // Or, are (x0,y0), (x1,y1) and (x2,y2) collinear?
      // Equivalently, is (x1,y1) coincident with (x2,y2)?
      // Or, is the radius zero? Line to (x1,y1).
      // this._ += "L" + (this._x1 = x1) + "," + (this._y1 = y1);
      this.lineTo(x1, y1);
      [x0, y0] = applyToPoint(inverse(this._matrix), [this._x1, this._y1]);
    }

    // Otherwise, draw an arc!
    else {
      var x20 = x2 - x0,
        y20 = y2 - y0,
        l21_2 = x21 * x21 + y21 * y21,
        l20_2 = x20 * x20 + y20 * y20,
        l21 = Math.sqrt(l21_2),
        l01 = Math.sqrt(l01_2),
        l =
          r *
          Math.tan(
            (pi - Math.acos((l21_2 + l01_2 - l20_2) / (2 * l21 * l01))) / 2
          ),
        t01 = l / l01,
        t21 = l / l21;

      // If the start tangent is not coincident with (x0,y0), line to.
      if (Math.abs(t01 - 1) > epsilon) {
        // this._ += "L" + (x1 + t01 * x01) + "," + (y1 + t01 * y01);
        this.lineTo(x1 + t01 * x01, y1 + t01 * y01);
        [x0, y0] = applyToPoint(inverse(this._matrix), [this._x1, this._y1]);
      }

      const x3 = x1 + t21 * x21;
      const y3 = y1 + t21 * y21;

      const h = Math.hypot(x3 - x0, y3 - y0);
      const a = Math.asin(h / 2 / r) * 2;

      const x4 = (x0 + x3) / 2;
      const y4 = (y0 + y3) / 2;

      const basex = (Math.sqrt(r * r - Math.pow(h / 2, 2)) * (y3 - y0)) / h;
      const basey = (Math.sqrt(r * r - Math.pow(h / 2, 2)) * (x0 - x3)) / h;

      const startAngle = Math.atan2(y0 - y4 + basey, x0 - x4 + basex);
      this.arc(x4 - basex, y4 - basey, r, startAngle, startAngle + a);
    }
  }

  ellipse(x, y, rx, ry, rot, a0, a1, ccw = false) {
    const [_x1, _y1] = applyToPoint(inverse(this._matrix), [
      this._x1,
      this._y1,
    ]);

    if (a0 < 0) a0 = (a0 + tau) % tau;
    if (a1 < 0) a1 = (a1 + tau) % tau;

    const maxR = Math.max(rx, ry);

    let a = ccw ? a0 - a1 : a1 - a0;
    if (a < 0) a = (a + tau) % tau;

    let inc =
      1 / Math.sqrt(maxR * this._arcScale - Math.pow(this._arcScale, 2));

    if (isNaN(inc) || inc > 1 / 8) {
      inc = 1 / 8;
    }

    const n = Math.ceil(a / inc);
    const cw = ccw ? -1 : 1;

    if (rx < 0) throw new Error(`negative x radius: ${rx}`);
    if (ry < 0) throw new Error(`negative y radius: ${ry}`);

    for (var c = 0; c <= n; c++) {
      let i = c === n ? a1 : a0 + c * inc * cw;

      let x0 =
        x -
        ry * Math.sin(i) * Math.sin(rot * Math.PI) +
        rx * Math.cos(i) * Math.cos(rot * Math.PI);
      let y0 =
        y +
        rx * Math.cos(i) * Math.sin(rot * Math.PI) +
        ry * Math.sin(i) * Math.cos(rot * Math.PI);

      // Is this path empty? Move to (x0,y0).
      if (!c) {
        if (this._x1 === null) {
          this.moveTo(x0, y0);
        }
        // Or, is (x0,y0) not coincident with the previous point? Line to (x0,y0).
        else if (Math.abs(_x1 - x0) > epsilon || Math.abs(_y1 - y0) > epsilon) {
          this.lineTo(x0, y0);
          continue;
        }
      }

      this.lineTo(x0, y0);
    }
  }

  rect(x, y, w, h) {
    this.moveTo(x, y);
    this.lineTo(x + w, y);
    this.lineTo(x + w, y + h);
    this.lineTo(x, y + h);
    this.lineTo(x, y);
  }

  polylines() {
    return this._lines;
  }
}
