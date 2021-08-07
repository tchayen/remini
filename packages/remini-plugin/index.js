function remini() {
  return {
    name: "remini",
    config() {
      return {
        esbuild: {
          jsxFactory: "c",
          jsxFragment: "Fragment",
        },
      };
    },
  };
}

module.exports = remini;
