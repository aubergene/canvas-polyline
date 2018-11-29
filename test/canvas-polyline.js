const assert = require('assert')
const sinon = require('sinon')
const CanvasPolyline = require('../dist/index.umd')

describe('CanvasPolyline', function () {
  const moveTo = sinon.spy()
  const lineTo = sinon.spy()
  const context = { moveTo, lineTo }
  var ctx

  beforeEach(function () {
    moveTo.resetHistory()
    lineTo.resetHistory()
    ctx = new CanvasPolyline(context)
  });

  it('moveTo', function() {
    ctx.moveTo(0, 0)
    assert(moveTo.called)
  })

  it('lineTo', function() {
    ctx.lineTo(0, 0)
    assert(lineTo.called)
  })

  it("closePath", function () {
    ctx.moveTo(150, 50);
    assert.equal(moveTo.callCount, 1)
    assert.equal(lineTo.callCount, 0)
    ctx.closePath();
    assert.equal(moveTo.callCount, 1)
    assert.equal(lineTo.callCount, 1)
    ctx.lineTo(250, 150);
    ctx.closePath();
    assert.equal(moveTo.callCount, 1)
    assert.equal(lineTo.callCount, 3)
  });

  it('rect', function() {
    ctx.rect(0, 0, 100, 200)
    assert.equal(moveTo.callCount, 1)
    assert.equal(lineTo.callCount, 4)
  })

  it('quadraticCurveTo', function() {
    ctx.quadraticCurveTo(100, 50, 200, 100);
    assert.equal(moveTo.callCount, 0)
    assert.equal(lineTo.callCount, 3)
  })

  it('bezierCurveTo', function() {
    ctx.bezierCurveTo(100, 50, 0, 24, 200, 100);
    assert.equal(moveTo.callCount, 0)
    assert.equal(lineTo.callCount, 15)
  })

})
