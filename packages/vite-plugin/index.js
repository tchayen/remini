const fs = require("fs");
const path = require("path");
const { transformSync } = require("@babel/core");
const babelPlugin = require("../babel-plugin");

const runtimePublicPath = "/@fast-refresh";
const runtimeFilePath = path.join(__dirname, "../babel-plugin/runtime.js");
const runtimeCode = fs.readFileSync(runtimeFilePath, "utf-8");

function isComponentLikeIdentifier(node) {
  return (
    node.type === "Identifier" &&
    typeof node.name === "string" &&
    /^[A-Z]/.test(node.name)
  );
}

const preambleCode = `
import RefreshRuntime from "${runtimePublicPath}"
// RefreshRuntime.injectIntoGlobalHook(window)
window.$RefreshReg$ = () => {}
window.$RefreshSig$ = () => (type) => type
window.__refresh_plugin_enabled__ = true
`;

const cleanIndent = (code) => {
  const lines = code.split("\n");
  const firstLine = lines[0].length === 0 ? 1 : 0;
  const offset = lines[firstLine].match(/^(\s*)/)[0].length;
  return lines.map((line) => line.substring(offset, line.length)).join("\n");
};

// If every export is a component, we can assume it's a refresh boundary.
function isRefreshBoundary(ast) {
  return ast.program.body.every((node) => {
    if (node.type !== "ExportNamedDeclaration") {
      return true;
    }

    const { declaration, specifiers } = node;
    if (declaration) {
      if (declaration.type === "VariableDeclaration") {
        return declaration.declarations.every((variable) =>
          isComponentLikeIdentifier(variable.id)
        );
      }

      if (declaration.type === "FunctionDeclaration") {
        return isComponentLikeIdentifier(declaration.id);
      }
    }

    return specifiers.every((spec) => {
      return isComponentLikeIdentifier(spec.exported);
    });
  });
}

function refreshPlugin() {
  let shouldSkip = false;

  console.log("Plugin loaded");

  return {
    name: "refresh",
    enforce: "pre",
    configResolved(config) {
      shouldSkip = config.command === "build" || config.isProduction;
    },
    resolveId(id) {
      if (id === runtimePublicPath) {
        return id;
      }
    },

    load(id) {
      if (id === runtimePublicPath) {
        return runtimeCode;
      }
    },
    transformIndexHtml() {
      if (shouldSkip) {
        return;
      }

      return [
        {
          tag: "script",
          attrs: { type: "module" },
          children: preambleCode,
        },
      ];
    },
    async transform(code, id, ssr) {
      if (
        shouldSkip ||
        !/\.(t|j)sx?$/.test(id) ||
        id.includes("node_modules") ||
        id.includes("?worker") ||
        ssr
      ) {
        return;
      }

      const parserPlugins = [/\.tsx?$/.test(id) && "typescript"];

      const result = transformSync(code, {
        babelrc: false,
        configFile: false,
        filename: id,
        parserOpts: {
          sourceType: "module",
          allowAwaitOutsideFunction: true,
          plugins: parserPlugins,
        },
        plugins: [
          // babelPlugin
        ],
        ast: true,
        sourceMaps: true,
        sourceFileName: id,
      });

      if (result === null) {
        throw new Error("Babel transformation didn't succeed.");
      }

      // No component detected in the file.
      if (!/\$RefreshReg\$\(/.test(result.code)) {
        return code;
      }

      const header = cleanIndent(`
        import RefreshRuntime from "${runtimePublicPath}";
        let prevRefreshReg;
        let prevRefreshSig;

        if (!__refresh_plugin_enabled__) {
          throw new Error("Refresh plugin can't detect initialization code.");
        }

        if (import.meta.hot) {
          prevRefreshReg = window.$RefreseshReg$;
          prevRefreshSig = window.$RefreshSig$;
          window.$RefreshReg$ = (type, id) => {
            RefreshRuntime.register(type, ${JSON.stringify(id)} + " " + id);
          };
          // window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;
        }
        // </FastRefreshHeader>
      `);

      const footer = cleanIndent(`
        // <FastRefreshFooter>
        if (import.meta.hot) {
          window.$RefreshReg$ = prevRefreshReg;
          window.$RefreshSig$ = prevRefreshSig;

          if (${isRefreshBoundary(result.ast)}) {
            import.meta.hot.accept();
            console.log('HOT ${id}');
          }

          if (!window.__refresh_timeout) {
            window.__refresh_timeout = setTimeout(() => {
              window.__refresh_timeout = 0;
              RefreshRuntime.performReactRefresh();
            }, 30);
          }
        }
      `);

      return {
        code: `${header}${result.code}${footer}`,
        map: result.map,
      };
    },
  };
}

module.exports = refreshPlugin;
