# canvas-polyline

This library aims to give a HTML Canvas compatible API which produces all output using **only straight lines**, i.e. it reduces all commands to `moveTo` and `lineTo`. This makes it very easy to then adapt the output to be compatible with many file formats and devices.

## PLAN

* `toHPGL` takes MD's config, same as his SVG convert. Does translate based on paper size so that top left is 0,0. 
* `plot-hpgl` has config which cam take dimensions of plotter to translate 0,0 to bottom left (or wherever)


## Usage

```js
var ctx = new CanvasPolyline([canvasCtx, hpglCtx]) // Takes a single Canvas API contexts or an array of them
ctx.rect(0, 0, 100, 100)
// Each context will now get called with the following commands
// moveTo(0, 0)
// lineTo(100,0)
// lineTo(100,100)
// lineTo(0,100)
// lineTo(0,0)
```

# Backstory

My initial motivation for creating this project was so I could use the HTML Canvas API with Roland DPX-3300 plotter. The plotter only understands [HPGL](https://en.wikipedia.org/wiki/HP-GL). I started by creating [d3-hpgl](https://github.com/aubergene/d3-hpgl), which translates Canvas commands in to the equivilient HPGL, however HPGL (at least version for my plotter) doesn't have native support for quadtractics, beziers or elipses. Additionally I wanted to have support for transformations, so I created this library.

## Thanks

The code has been adapted from [d3-path](https://github.com/d3/d3-path), and uses [adaptive-bezier-curve](https://github.com/mattdesl/adaptive-bezier-curve), [adaptive-quadratic-curve](https://github.com/mattdesl/adaptive-quadratic-curve) and [transformation-matrix](https://github.com/chrvadala/transformation-matrix). thanks BH
