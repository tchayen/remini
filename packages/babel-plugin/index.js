function isComponentLikeName(name) {
  return typeof name === "string" && /^[A-Z]/.test(name);
}

// Find out if hooks changed and component needs to be re-mounted or just re-rendered.
export default function babelPlugin(babel) {
  const { types: t } = babel;

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
        const id = node.id;
        console.log("ExportDefaultDeclaration", id);
      },
      FunctionDeclaration(path) {
        const node = path.node;
        const id = node.id;
        const inferredName = id.name;

        console.log("FunctionDeclaration.enter", { inferredName });
        if (!isComponentLikeName(inferredName)) {
          return;
        }

        // if (seenForRegistration.has(node)) {
        //   return;
        // }
        // seenForRegistration.add(node);

        // const handle = createRegistration(programPath, persistentID);
      },
      Program: {
        exit(path) {},
      },
    },
  };
}
