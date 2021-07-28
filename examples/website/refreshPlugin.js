const { transformSync } = require("@babel/core");

const transform = (code, path, plugins) =>
  transformSync(code, {
    plugins: [],
    parserOpts: {
      plugins,
    },
    ast: false,
    sourceMaps: true,
    sourceFileName: path,
    configFile: false,
    babelrc: false,
  });

module.exports = function refreshPlugin(options = {}) {
  let shouldSkip = false;

  console.log("Plugin");

  return {
    name: "refresh",
    configResolved(config) {
      shouldSkip = config.command === "build" || config.isProduction;
    },
    async transform(code, id, ssr) {
      console.log(id, ssr);
      if (
        shouldSkip ||
        !/\.(t|j)sx?$/.test(id) ||
        id.includes("node_modules") ||
        id.includes("?worker") ||
        ssr
      ) {
        return;
      }

      const parserPlugins = [
        /\.tsx?$/.test(id) && "typescript",
        ...(options.parserPlugins || []),
      ];
      const result = transform(code, id, parserPlugins);

      return {
        code: result.code,
        map: result.map,
      };
    },
  };
};
