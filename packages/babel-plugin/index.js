function isComponentLikeName(name) {
  return typeof name === "string" && /^[A-Z]/.test(name);
}

// Find out if hooks changed and component needs to be re-mounted or just re-rendered.
export default function babelPlugin(babel) {
  const { types: t } = babel;

  const refreshSig = t.identifier("$RefreshSig$");
  const refreshReg = t.identifier("$RefreshReg$");

  const registrationsByProgramPath = new Map();

  // function createRegistration(programPath: NodePath<Program>, persistentID) {
  //   const handle = programPath.scope.generateUidIdentifier("c");
  //   if (!registrationsByProgramPath.has(programPath)) {
  //     registrationsByProgramPath.set(programPath, []);
  //   }
  //   const registrations = registrationsByProgramPath.get(programPath);
  //   registrations.push({
  //     handle,
  //     persistentID,
  //   });
  //   return handle;
  // }

  return {
    visitor: {
      ExportDefaultDeclaration(path) {
        const node = path.node;
        console.log(
          "ExportDefaultDeclaration",
          node.id || node.declaration.name
        );
      },
      FunctionDeclaration: {
        exit(path) {
          const node = path.node;
          const id = node.id;
          const inferredName = id.name;

          console.log("FunctionDeclaration", inferredName);
          if (!isComponentLikeName(inferredName)) {
            return;
          }

          const sigCallId = path.scope.generateUidIdentifier("s");
          // var _s = $$refreshSig$$().
          path.scope.parent.push({
            id: sigCallId,
            init: t.callExpression(refreshSig, []),
          });

          // _s() inside component.
          path
            .get("body")
            .unshiftContainer(
              "body",
              t.expressionStatement(t.callExpression(sigCallId, []))
            );

          // _s(App, "TODO#1") after component.
          path.insertAfter(
            t.expressionStatement(
              t.callExpression(sigCallId, [id, t.stringLiteral("TODO#1")])
            )
          );
        },
      },
      ArrowFunctionExpression(path) {
        console.log("ArrowFunctionExpression");
      },
      FunctionExpression(path) {
        console.log("FunctionExpression");
      },
      ExportNamedDeclaration(path) {
        console.log("ExportNamedDeclaration");
      },
      Program: {
        exit(path) {
          const cCallId = path.scope.generateUidIdentifier("c");

          // var _c = App. TODO assignment.
          path.pushContainer(
            "body",
            t.variableDeclaration("var", [t.variableDeclarator(cCallId)])
          );

          // $RefreshReg$(_c, "TODO#2");
          path.pushContainer(
            "body",
            t.expressionStatement(
              t.callExpression(refreshReg, [cCallId, t.stringLiteral("TODO#2")])
            )
          );
        },
      },
    },
  };
}
