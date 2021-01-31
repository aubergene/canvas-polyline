import buble from "@rollup/plugin-buble";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { terser } from "rollup-plugin-terser";

export default [
  {
    input: "src/index.js",
    plugins: [
      buble(),
      resolve(),
      commonjs(),
      // terser({
      //   compress: {
      //     drop_console: true,
      //   },
      // }),
    ],
    output: {
      file: "dist/canvas-polyline.min.js",
      name: "CanvasPolyline",
      format: "umd",
      sourcemap: true,
    },
  },
];
