// This plugin replaces calls to import.meta with call to NAME, which is an
// object injected to the top of the file.
function plugin({ types: t }) {
  const NAME = "$meta$";

  return {
    visitor: {
      MetaProperty(path) {
        path.replaceWith(t.identifier(NAME));
      },
      Program(path) {
        const metaProperties = [
          t.objectProperty(
            t.identifier("env"),
            t.objectExpression([
              t.objectProperty(t.identifier("DEV"), t.booleanLiteral(true)),
            ])
          ),
        ];

        path.unshiftContainer(
          "body",
          t.variableDeclaration("const", [
            t.variableDeclarator(
              t.identifier(NAME),
              t.objectExpression(metaProperties)
            ),
          ])
        );
      },
    },
  };
}

module.exports = function preset() {
  return {
    plugins: [plugin],
  };
};
