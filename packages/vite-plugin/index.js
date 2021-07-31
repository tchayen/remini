import { transformSync } from "@babel/core";
import babelPlugin from "../babel-plugin";

function isComponentLikeIdentifier(node) {
  return (
    node.type === "Identifier" &&
    typeof node.name === "string" &&
    /^[A-Z]/.test(node.name)
  );
}

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
    configResolved(config) {
      shouldSkip = config.command === "build" || config.isProduction;
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

      console.log(id.replace(__dirname, ""), ssr);

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
        plugins: [babelPlugin],
        ast: true,
        sourceMaps: true,
        sourceFileName: id,
      });

      if (result === null) {
        throw new Error("Babel transformation didn't succeed.");
      }

      const header = `
        if (import.meta.hot) {
          // Set up HMR here.
          console.log('> ${id.replace(__dirname, "")}');
        }
      `;

      const footer = `
        if (import.meta.hot) {
          if (${isRefreshBoundary(result.ast)}) {
            import.meta.hot.accept();
            console.log('HOT ${id.replace(__dirname, "")}');
          } else {
            console.log('not ${id.replace(__dirname, "")}');
          }

          if (!window.__refresh_timeout) {
            window.__refresh_timeout = setTimeout(() => {
              window.__refresh_timeout = 0;
              // TODO: refresh.
              console.log('Refresh');
            }, 30);
          }
        }
      `;

      return {
        code: `${header}${result.code}${footer}`,
        map: result.map,
      };
    },
  };
}

module.exports = refreshPlugin;
