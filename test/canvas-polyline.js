const assert = require("assert");
const sinon = require("sinon");
const CanvasPolyline = require("../dist/canvas-polyline.umd");

describe("CanvasPolyline", function() {
  const moveTo = sinon.spy();
  const lineTo = sinon.spy();
  const context = { moveTo, lineTo };
  var ctx;

  beforeEach(function() {
    moveTo.resetHistory();
    lineTo.resetHistory();
    ctx = new CanvasPolyline(context);
  });

  it("moveTo", function() {
    ctx.moveTo(0, 0);
    assert(moveTo.called);
  });

  it("lineTo", function() {
    ctx.lineTo(0, 0);
    assert(lineTo.called);
  });

  it("closePath", function() {
    ctx.moveTo(150, 50);
    assert.equal(moveTo.callCount, 1);
    assert.equal(lineTo.callCount, 0);
    ctx.closePath();
    assert.equal(moveTo.callCount, 1);
    assert.equal(lineTo.callCount, 1);
    ctx.lineTo(250, 150);
    ctx.closePath();
    assert.equal(moveTo.callCount, 1);
    assert.equal(lineTo.callCount, 2);
  });

  it("rect", function() {
    ctx.rect(0, 0, 100, 200);
    assert.equal(moveTo.callCount, 1);
    assert.equal(lineTo.callCount, 4);
  });

  it("quadraticCurveTo", function() {
    ctx.quadraticCurveTo(100, 50, 200, 100);
    assert.equal(moveTo.callCount, 0);
    assert.equal(lineTo.callCount, 3);
  });

  it("bezierCurveTo", function() {
    ctx.bezierCurveTo(100, 50, 0, 24, 200, 100);
    assert.equal(moveTo.callCount, 0);
    assert.equal(lineTo.callCount, 15);
  });

  it("resetTransform", function() {
    ctx.lineTo(0, 100);
    assert.deepEqual(lineTo.args[0], [0, 100]);
    ctx.scale(2, 2);
    ctx.lineTo(0, 100);
    assert.deepEqual(lineTo.args[1], [0, 200]);
    ctx.resetTransform();
    ctx.lineTo(0, 100);
    assert.deepEqual(lineTo.args[2], [0, 100]);
  });

  it("save/restore", function() {
    ctx.lineTo(0, 100);
    assert.deepEqual(lineTo.args[0], [0, 100]);
    ctx.scale(2, 2);
    ctx.lineTo(0, 100);
    assert.deepEqual(lineTo.args[1], [0, 200]);
    ctx.translate(100, 0);
    ctx.lineTo(0, 100);
    assert.deepEqual(lineTo.args[2], [200, 200]);
    ctx.strokeStyle = "#c00";
    assert.equal(ctx.strokeStyle, "#c00");
    ctx.save();

    ctx.scale(4, 2);
    ctx.translate(400, 0);
    ctx.lineTo(0, 100);
    assert.deepEqual(lineTo.args[2], [200, 200]);
    ctx.strokeStyle = "#0c0";
    assert.equal(ctx.strokeStyle, "#0c0");

    ctx.restore();
    ctx.lineTo(0, 100);
    assert.deepEqual(lineTo.args[2], [200, 200]);
    assert.equal(ctx.strokeStyle, "#c00");
  });
});
