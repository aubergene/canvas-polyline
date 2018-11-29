# canvas-polyline

This library aims to give a HTML Canvas compatible API which produces all output using straight lines, i.e. it reduces all commands to `moveTo` and `lineTo`. This makes it very easy to then adapt the output to be compatible with many file formats and devices.

The code has been adapted from [d3-path](https://github.com/d3/d3-path), and uses [adaptive-bezier-curve](https://github.com/mattdesl/adaptive-bezier-curve), [adaptive-quadratic-curve](https://github.com/mattdesl/adaptive-quadratic-curve) and [transformation-matrix](https://github.com/chrvadala/transformation-matrix).
