// eslint-disable-next-line
const babelJestMetaPlaceholderPreset = require("./babelJestMetaPlaceholderPreset");

module.exports = {
  presets: [
    babelJestMetaPlaceholderPreset,
    ["@babel/preset-env", { targets: { node: "current" } }],
    "@babel/preset-typescript",
  ],
};
