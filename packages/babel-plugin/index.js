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

  const analyzeBody = (path, name, insertPath) => {
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

    // Two next calls are in reversed order because of the way they are inserted.

    // $RefreshReg$(A);
    insertPath.insertAfter(t.callExpression(refreshReg, [t.identifier(name)]));

    // A.$id$ = $id$("A");
    insertPath.insertAfter(
      t.assignmentExpression(
        "=",
        t.memberExpression(t.identifier(name), t.identifier("$id$")),
        t.callExpression(t.identifier("$id$"), [t.stringLiteral(name)])
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

          console.log("FunctionDeclaration", name);

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

        console.log("VariableDeclaration", name);

        const declarations = path.get("declarations")[0];
        const init = declarations.get("init");
        analyzeBody(init, name, path);
      },
      Program: {
        exit(path) {
          const cCallId = path.scope.generateUidIdentifier("c");

          // // var _c = App. TODO assignment.
          // path.pushContainer(
          //   "body",
          //   t.variableDeclaration("var", [t.variableDeclarator(cCallId)])
          // );
        },
      },
    },
  };
}
