const importMetaPreset = require("../import-meta-preset");

module.exports = {
  presets: [
    importMetaPreset,
    ["@babel/preset-env", { targets: { node: "current" } }],
    "@babel/preset-typescript",
  ],
};
