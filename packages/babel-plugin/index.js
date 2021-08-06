function isComponentLikeName(name) {
  return typeof name === "string" && /^[A-Z]/.test(name);
}

export default function babelPlugin(babel) {
  const { types: t } = babel;

  const refreshReg = t.identifier("$RefreshReg$");

  const hookCalls = new Map();

  function getHookCallsSignature(functionNode) {
    const fnHookCalls = hookCalls.get(functionNode);

    if (fnHookCalls === undefined) {
      return null;
    }

    return {
      key: fnHookCalls.map((call) => call.key).join(";"),
    };
  }

  const HookSearcher = {
    CallExpression(path) {
      const node = path.node;
      const callee = node.callee;

      let name = null;
      switch (callee.type) {
        case "Identifier":
          name = callee.name;
          break;
        case "MemberExpression":
          name = callee.property.name;
          break;
      }

      if (name === null || !/^use[A-Z]/.test(name)) {
        return;
      }

      const fnScope = path.scope.getFunctionParent();
      const fnNode = fnScope.block;

      if (!hookCalls.has(fnNode)) {
        hookCalls.set(fnNode, []);
      }
      const hookCallsForFn = hookCalls.get(fnNode);

      let key = "";
      if (path.parent.type === "VariableDeclarator") {
        // TODO: if there is no LHS, consider some other heuristic.
        key = path.parentPath.get("id").getSource();
      }

      const args = path.get("arguments");

      if (name === "useState" && args.length > 0) {
        // useState first argument is initial state.
        key += " = useState(" + args[0].getSource() + ")";
      }

      // TODO
      // if (name === 'useReducer' && args.length > 1) {
      //   // useReducer second argument is initial state.
      //   key += '(' + args[1].getSource() + ')';
      // }

      hookCallsForFn.push({
        callee: path.node.callee,
        name,
        key,
      });
    },
  };

  const analyzeBody = (path, name, insertPath) => {
    const fnNode = path.node;
    const hooks = getHookCallsSignature(fnNode);

    // $RefreshReg$(A, $id$(), "A", "[counter, setCounter] = useState(0)");
    insertPath.insertAfter(
      t.callExpression(
        refreshReg,
        [
          t.identifier(name),
          t.callExpression(t.identifier("$id$"), []),
          t.stringLiteral(name),
          hooks && t.stringLiteral(hooks.key),
        ].filter(Boolean)
      )
    );
  };

  return {
    visitor: {
      ExportDefaultDeclaration(path) {
        //
      },
      FunctionDeclaration: {
        exit(path) {
          const name = path.node.id.name;

          if (!isComponentLikeName(name)) {
            return;
          }

          analyzeBody(path, name, path);
        },
      },
      ExportNamedDeclaration(path) {
        //
      },
      VariableDeclaration(path) {
        const name = path.node.declarations[0].id.name;

        if (!isComponentLikeName(name)) {
          return;
        }

        // switch (path.parent.type) {
        //   case "Program":
        //     console.log("Program");
        //     break;
        //   case "ExportNamedDeclaration":
        //     console.log("ExportNamedDeclaration");
        //     break;
        //   case "ExportDefaultDeclaration":
        //     console.log("ExportDefaultDeclaration");
        //     break;
        // }

        const declarations = path.get("declarations")[0];
        const init = declarations.get("init");

        if (
          init.type !== "ArrowFunctionExpression" &&
          init.type !== "FunctionExpression"
        ) {
          return;
        }

        analyzeBody(init, name, path);
      },
      Program: {
        enter(path) {
          path.traverse(HookSearcher);
        },
        exit() {
          hookCalls.clear();
        },
      },
    },
  };
}
